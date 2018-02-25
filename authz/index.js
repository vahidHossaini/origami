var uuid=require('uuid')
module.exports = class authz
{
  constructor(config,dist)
  {
    this.context=config.context
    this.roleKey=['name']
    this.aclKey=['userid']
    dist.addFunction('authz','getRoles',this.getRoles,this)
    dist.addFunction('authz','saveRoles',this.saveRoles,this)
    dist.addFunction('authz','deleteRoles',this.deleteRoles,this)
    dist.addFunction('authz','checkRole',this.checkRole,this)
    dist.addFunction('authz','setAccess',this.setAccess,this)
    dist.addFunction('authz','getAccess',this.getAccess,this)
    dist.addFunction('authz','getUiAccess',this.getUiAccess,this)
    
    global.auth['authz']={ 
        'getUiAccess':'login'
        
        }
    global.db.Config(config.context,[
        {
            name:'role',
            tableName:'role',
            cols:{
                name:{isKey:true,type:'string',isForce:true},
                access:{isKey:true,type:'Json',isForce:true},
                ui:{isKey:true,type:'Json',isForce:true},
            }
        },
        {
            name:'acl',
            tableName:'acl',
            cols:{
                userid:{isKey:true,type:'string',isForce:true},
                roles:{isKey:true,type:'Json',isForce:true}, 
            }
        },
        
    ],(e,d)=>{
        
      console.log('Completed')
        this.loadRole(this)
        
    })
  }
  //private
  loadRole(self)
  {
      self.roles={}
    global.db.Search(self.context,'role',{where:{active:true}},{},(e,d)=>{
        if(!d || !d.value)
            return
        
        for(var a of d.value)
        {
            self.roles[a.name]=a.access
        }            
    })
  }


  getRoles(msg,func,self)
  {
      var dt=msg.data
      global.db.Search(self.context,'role',{},dt,(e,d)=>{
        self.loadRole(self)
        return func(e,d)
      })
  }
  saveRoles(msg,func,self)
  {
      var dt=msg.data 
      global.db.Save(self.context,'role',self.roleKey,dt,(e,d)=>{
          return func(e,d)
      })
  }
  setAvtivityRoles(msg,func,self)
  {
      var dt=msg.data
      if(!dt.id)
          return func({message:'app001'})
      
      global.db.Update(self.context,'role',self.roleKey,{id:dt.id,active:dt.activity},(e,d)=>{
          return func(e,d)
      })
  }
  checkRole(msg,func,self)
  {
    var dt=msg.data
    var session=msg.session
    console.log('roles')
    console.log(dt)
    console.log(session.roles)
    if(!session || !session.roles)
        return func({})
    var url=dt.domain+'/'+dt.subDomain
    for(var a in session.roles)
    {  
        if(self.roles[a] && self.roles[a][url])
            return func(null,{isDone:true})
    }
    return func({})
  }
  setAccess(msg,func,self)
  {
      var dt=msg.data
      if(!dt.userid || !dt.roles)
          return func({message:'app001'})
      global.db.Save(self.context,'acl',self.aclKey,{userid:dt.userid,roles:dt.roles},(e,d)=>{
          return func(e,d)
      })
  }
  getAccess(msg,func,self)
  {
      var dt=msg.data
      if(!dt.userid  )
          return func({message:'app001'})
      
      global.db.Search(self.context,'acl',{where:{userid:dt.userid}},dt,(e,d)=>{ 
        return func(e,d)
      }) 
  }
  getUiAccess(msg,func,self)
  {
    var dt=msg.data
    var session=msg.session
    if(!session || !session.roles)
        return func(null,{})
    
    if(session && session.superadmin)
        return func(null,{sadmin:true})
    var ret={}
    for(var a in session.roles)
    {  
        if(self.roles[a] )
            for(var x in self.roles[a])
                ret[x]=self.roles[a][x]
    }
    return func(null,ret)
      
  }
}
