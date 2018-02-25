var route={}
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
        //console.log(route[domain][subDomain])
    if(route[domain] && route[domain][subDomain])
    {
      return route[domain][subDomain].func(data,func,route[domain][subDomain].self)
    }
    return func({routeMessage:'Not Mach'})
  }
}
