var route={}
var Promise = require('promise');
module.exports = class distributorService
{
  constractor()
  {

  }
  addFunction(domain,subDomain,func,self)
  {
    if(!route[domain])
      route[domain]={}
    route[domain][subDomain]={func:func,self:self}

  }
  run(domain,subDomain,data,func)
  {   
    if(route[domain] && route[domain][subDomain])
    {
       if(!func)
       {
            return new Promise(function (resolve, reject) {
                route[domain][subDomain].func(data,(ee,dd)=>{
                    if(ee)
                        return reject(ee)
                    //console.log('DataBase',domain,subDomain,dd)
                    return resolve(dd)
                },route[domain][subDomain].self)
            })
       }           
      return route[domain][subDomain].func(data,func,route[domain][subDomain].self)
    }
    if(func)
        return func({routeMessage:'Not Mach'})
    
    return new Promise(function (resolve, reject) {
        reject({routeMessage:'Not Mach'})
    })
    
  }
}
