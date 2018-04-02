//1 Require User Pass
//2 Wrong User or Pass
//3 Not Active
//4 Not Verify
//5 Exist Username
//6 User Not Exist
//7 Username or Code Wrong


//app001    require
var uuid=require('uuid')
module.exports = class userpassClass
{
  constructor(config)
  {
    this.context=config.context
    this.ntContext=config.ntContext
    this.config=config
    this.userKey=['username']
    
  }
  login(msg,func)
  {
    var dt=msg.data
    if(!dt.username || !dt.password)
      return func({message:'auth001'})
    var sm=this.config.superadmin
    if(sm && sm.username==dt.username && sm.password==dt.password)
    {
      return func(null,{isDone:true,session:[{name:'userid',value:'1'},{name:'superadmin',value:true}]})
        
    }
    global.db.Search(this.context,'orUsers',{where:{$and:[{username:dt.username},{password:dt.password}]}},{},(e,d)=>{
         
      if(!d.value.length)
      {
        return func({message:'auth002'})
      }
      var user=d.value[0] 
      if(!user.active)
      {
        return func({message:'auth003'})
      }
      if(!user.verify)
      {
        return func({message:'auth004'})
      }
      var session=[{name:'userid',value:user.userid}]
      if(user.emailcode)
          session.push({name:'notEmailVerify',value:true})  
      if(user.mobilecode)
          session.push({name:'notMobileVerify',value:true})  
      if(user.twoStepType)
      {
            var code=global.rand(1111,9999).toString()
            global.db.Update(this.context,'orUsers',this.userKey,{username:user.username,twoStep:code},(ee,dd)=>{  
                if(user.twoStepType=='email')
                    global.nt.Send(this.ntContext,'emailTwoStep',{code:code,to:user.email},(e,d)=>{
                        return func(null,{isDone:true,twoStep:true})
                    })
            })
          
          return
      }
      global.db.Search(this.context,'acl',{where:{userid:user.userid}},{},(e1,d1)=>{
            if(d1 && d1.value.length)
                session.push({name:'roles',value:d1.value[0].roles}) 
            else
                session.push({name:'roles',value:{}}) 
          console.log('session')
          console.log(session)
        return func(null,{isDone:true,session:session})
      })
    })
  }
  updateuser(msg,func)
  {
    var dt=msg.data
    if(!dt.userid)
    {
        dt.userid=uuid.v4()
    }
    else        
        delete dt.userid
    
      global.db.Save(this.context,'orUsers',this.userKey,dt,func)
  }
  getusers(msg,func)
  {
    var dt=msg.data
      global.db.Search(this.context,'orUsers',{select:['username','userid','active','verify']},dt,(e,d)=>{
           
            func(e,d)
      })
  }
  create(msg,func)
  {
    var dt=msg.data
    var session=msg.session
    if(!dt.username || !dt.password)
      return func({message:'db001'})
  
    var sm=this.config.superadmin
    if(sm && sm.username==dt.username)
        return func({message:'auth005'})
  
    global.db.Search(this.context,'orUsers',{username:dt.username},{},(e,d)=>{
      if(!d.value || d.value.length )
        return func({message:'auth005'})
      dt.id=uuid.v4()
      global.db.Save(this.context,'orUsers',this.userKey,dt,func)
    })

  }
  save(msg,func)
  {
    var dt=msg.data
    global.db.Save(this.context,'orUsers',this.userKey,dt,func)
  }
  logout(msg,func)
  { 
    return func(null,{isDone:true,session:[{name:'userid',value:null},{name:'superadmin',value:null}]})
  }
    register(msg,func)
    {
        var dt=msg.data
            
        var sm=this.config.superadmin
        if(sm && sm.username==dt.username)
            return func({message:'auth005'})
        
        this.getRequires(msg,(arr)=>{
            console.log('REQ',arr)
            for(var a of arr)
            {
                if(!dt[a])
                {
                   // console.log('login')
                   // console.log(a)
                    return func({message:'app001',name:[a]})
                }
            }
            if(!dt.username || !dt.password)
                return func({message:'app001',name:['username','password']})
            global.db.Search(this.context,'orUsers',{where:{username:dt.username}},{},(e,d)=>{
              if(!d.value || d.value.length )
                return func({message:'auth005'})
              if(this.config.requireEmail)
                dt.emailcode=uuid.v4()
              if(this.config.requireMobile)
                dt.mobilecode=uuid.v4()
              dt.userid=uuid.v4()
              dt.submitDate=new Date()
              dt.active=true
              dt.verify=true
              if(this.config.requireEmail || this.config.requireMobile)
                  dt.verify=false
              global.db.Save(this.context,'orUsers',this.userKey,dt,(e,d)=>{
                    func(e,d)     
                    if(e)
                        return
                    console.log('send',this.config.requireEmail)
                    if(this.config.requireEmail)                    
                        global.nt.Send(this.ntContext,'login',{username:dt.username,code:dt.emailcode,to:dt.email},(e,d)=>{
                            
                        })
              })
            })
            
        })
    }
    changePassword(msg,func)
    {  
        var dt=msg.data
        var session=msg.session
        if(!dt.oldPassword || !dt.newPassword)
          return func({message:'auth001'})
        global.db.Search(this.context,'orUsers',{where:{$and:[{userid:session.userid},{password:dt.oldPassword}]}},{},(e,d)=>{
             
          if(!d.value.length)
          {
            return func({message:'auth002'})
          }
          var user=d.value[0]
          if(!user.active)
          {
            return func({message:'auth003'})
          }
          if(!user.verify)
          {
            return func({message:'auth004'})
          }
          global.db.Update(this.context,'orUsers',this.userKey,{username:user.username,password:dt.newPassword},func)
          
        })
    }
    forgetPassword(msg,func)
    {
        var dt=msg.data
        if(!dt.name  )
          return func({message:'app001'})
        global.db.Search(this.context,'orUsers',{where:{$or:[{username:dt.name},{email:dt.name}]}},{},(e,d)=>{
            if(!d.value.length)
            {
                return func({message:'auth006'})
            }
          var user=d.value[0]
            var code=uuid.v4()
            global.db.Update(this.context,'orUsers',this.userKey,{username:user.username,forgetPassword:code},(ee,dd)=>{                
                global.nt.Send(this.ntContext,'resetPassword',{username:user.username,code:code,to:user.email},(e,d)=>{
                    return func(e,d)
                })
            })
        })
    }
    resetPassword(msg,func)
    {
        var dt=msg.data    
        if(!dt.username ||!dt.code || !dt.newPassword)
            return func({message:'app001'})
        global.db.Search(this.context,'orUsers',{where:{$and:[{username:dt.username},{forgetPassword:dt.code}]}},{},(e,d)=>{
        console.log(d)
            if(!d.value.length)
            {
                return func({message:'auth007'})
            }
            var user=d.value[0]
            
            global.db.Update(this.context,'orUsers',this.userKey,
            {
                username:user.username,
                password:dt.newPassword,
                forgetPassword:uuid.v4()
            },(ee,dd)=>{                
                return func(ee,dd)
            })
        })
        
    }
    verify(msg,func)
    {
        var dt=msg.data    
        if(!dt.code || !dt.name || !dt.type)
            return func({message:'app001'})
        
        global.db.Search(this.context,'orUsers',{where:{$or:[{username:dt.name},{email:dt.name}]}},{},(e,d)=>{
            if(!d.value.length)
            {
                return func({message:'auth006'})
            }
            var user=d.value[0]
            var updateobj={username:user.username}
            if(dt.type=='email' )
            {
                if(user.emailcode!=dt.code)
                    return func({message:'auth007'})
                updateobj.emailcode=''
                
            }
            if(dt.type=='mobile' )
            {
                if(user.mobilecode!=dt.code)
                    return func({message:'auth007'})
                updateobj.mobilecode=''
            }
            updateobj.verify=true 
            global.db.Update(this.context,'orUsers',this.userKey,updateobj,(ee,dd)=>{ 
                if(dd && dd.nModified)
                {
                    return func(null,{isDone:true})
                }
                return func(ee,dd)
            })  
        })
    }
    twoStep(msg,func)
    {
        var dt=msg.data    
        if(!dt.username ||!dt.code )
            return func({message:'app001'})
        global.db.Search(this.context,'orUsers',{where:{$and:[{username:dt.username},{twoStep:dt.code}]}},{},(e,d)=>{
        console.log(d)
            if(!d.value.length)
            {
                return func({message:'auth007'})
            }
            var user=d.value[0]
            var session=[{name:'userid',value:user.userid}]
            if(user.emailcode)
                session.push({name:'notEmailVerify',value:true})  
            if(user.mobilecode)
                session.push({name:'notMobileVerify',value:true})  
                
            return func(null,{isDone:true,session:session})
        })
    }
    oAuthUrl(msg,func)
    {
        
    }
    oAuthConfirm(msg,func)
    {
        
    }
    getInviteLink(msg,func)
    {
        
    }
    getRequires(msg,func)
    {
        var arr=['username','password']
            //console.log('REQ1',this.config)
        if(this.config.requireEmail)
            arr.push('email')
        if(this.config.requireMobile)
            arr.push('mobile')
        if(this.config.addItems)
            for(var a of this.config.addItems)
            {
                if(a.required)
                {
                    arr.push(a.name)
                }
            }
        return func(arr)
    }

}
