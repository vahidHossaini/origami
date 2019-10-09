var route={}
var structs={}
//var Promise = require('promise');
var servers={} 
var client=require('./remote')
module.exports = class distributorService
{
  constractor()
  {

  }
  setClass(domain,structure)
  {
      structs[domain]=structure
     // console.log('----',structure)
  }
  deleteDomain(domain)
  {
    delete route[domain]
  }
  addFunction(domain,subDomain,func,self,inputs)
  {
    if(!route[domain])
      route[domain]={}
    route[domain][subDomain]={func:func,self:self,domain:{domain:domain,subDomain:subDomain},inputs:inputs}

  }
    checkInputs(domain,subDomain,data,self)
    {
        var inp = route[domain][subDomain].inputs
        if(!inp || !structs[domain])
            return true
        for(var a of inp)
        {
        //console.log('--------------',data,a.name)
            if(!data[a.name] ) 
            {
                if(a.nullable)
                    return true
        //console.log('--------------1')
                return false
            }
            var dt=data[a.name]
            var st=structs[domain] 
            return self.checkValidStruct(dt,st,a.type,self)
            
        }
    }
    checkValidStruct(dt,st,type,self)
    {
           // console.log('>>>>>>>>>>>>>>>>>>>   ',st,type)
        if(!st[type])
        {
            if(type=='string' ||type=='number' ||type=='boolean' )
            {
                if(typeof(dt)==type)
                    return true
       // console.log('--------------2',type,dt)
                return false
            }
            else
            {
        //console.log('--------------3',st)
                return false
            }
        }
        //enumurable objects 
        if(!st[type].struct)
        {
            if(typeof(dt)!='number')
                return false
            isvalid=false
            for(var x in st)
            {
                if(st[x]===dt)
                    isvalid=true
            }
       // console.log('--------------4',isvalid)
            return isvalid
        }
        var isvalid=true
        let mst=st[type].struct
        for(var x in mst)
        {
            //console.log('-------',x,dt[x],mst[x])
            if(!dt[x])
            {
                return mst[x].nullable
            }
            if(!self.checkValidStruct(dt[x],st,mst[x].type,self))
                return false
        }
        return true
    }
    
   
    setServer(domain,srv)
    {
        if(!servers[domain])
            servers[domain]={srvs:[],c:0}
        for(var b of srv)
        {
            var cli=new client()
            cli.init(b,domain,this)
            //this.createSocket(servers[domain].srvs,b)
            servers[domain].srvs.push(cli)
        }
        
    }
    
  run(domain,subDomain,data,func)
  {   
  //
    //console.log('>>>>>>>>>>>>>>yyyy',servers[domain])
    if(servers[domain])
    {
            //console.log('1111>>>>>>>>>>>>>>server',servers[domain].srvs[servers[domain].c].send)
            console.log(func)
        if(!func)
        {
            var pr= servers[domain].srvs[servers[domain].c].send({
                domain:domain,
                service:subDomain,
                param:data
            })
    //console.log('>>>>>>>>>>>>>>pppppppppp',pr)
            servers[domain].c++
            if(servers[domain].c>=servers[domain].srvs.length)
            {
                servers[domain].c=0
            }
            return pr
        }
        var prm = servers[domain].srvs[servers[domain].c].send({
            domain:domain,
            service:subDomain,
            param:data
        }).then((dt)=>{
            console.log('>>>>>>>>>>>>>>xxxxxx   ',dt)
            func(null,dt)
        }).catch((err)=>{
            console.log('>>>>>>>>>>>>>>eeeeee   ',err)
            func(err,null)
            
        })
        
        servers[domain].c++
        if(servers[domain].c>=servers[domain].srvs.length)
        {
            servers[domain].c=0
        }
        return
    }
    if(route[domain] && route[domain][subDomain])
    {
        var self=route[domain][subDomain].self
        var mself=this
        
        if(!func)
        {
            return new Promise(function (resolve, reject) {
                var imp=mself.checkInputs(domain,subDomain,data.data,mself)
                if(!imp)
                    return reject({m:'not Valid Inputs'})
				//console.log('--->',route[domain][subDomain])
                route[domain][subDomain].func(data,(ee,dd)=>{
                    if(ee)
                        return reject(ee)
                    //console.log('DataBase',domain,subDomain,dd)
                    return resolve(dd)
                },self,route[domain][subDomain].domain)
            })
        }      
        if(!route[domain][subDomain].func)
        {
            console.log('Function Not Exist : ',domain,subDomain)
        }
        var imp=mself.checkInputs(domain,subDomain,data.data,mself)
        if(!imp)
            return func({m:'not Valid Inputs'})
        if(!route[domain][subDomain].func)
        {
            return func({m:'function not define'})

        }    
        return route[domain][subDomain].func(data,func,self,route[domain][subDomain].domain)
    }
    else
    {
         console.log('Not Mach ',domain,subDomain)
    }
    if(func)
    {
        console.log('Not Mach ',domain,subDomain)
        return func({routeMessage:'Not Mach '+domain+'/'+subDomain})
    }
    
    return new Promise(function (resolve, reject) {
        console.log('Not Mach ',domain,subDomain)
        reject({routeMessage:'Not Mach '+domain+'/'+subDomain})
    })
    
  }
}
