
module.exports = class services
{
  constructor(config,dist)
  {
       
    this.context=config.context
    this.driver=new (require(config.driver))(config,dist)
    for(var a of config.funcs)
    {
      dist.addFunction(config.domain,a.name, this.driver[a.name],this.driver)
    }
    global.authz[config.domain]=config.funcs
    global.auth[config.domain]={}
    for(var x of config.auth)
    {
      global.auth[config.domain][x]=true
    }
  }
}
