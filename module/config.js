module.exports = class databaseConfig
{
    constructor(config)
    { 
        this.type=config.type
        var path=global.path+'\\origami-modules\\'+config.type+'\\config.js'
        this.driver= new (require(path))(config.config)
    }
    getPackages()
    {
      return this.driver.getPackages()
    }
    
    getVersionedPackages()
    { 
      return this.driver.getVersionedPackages()
    }
    geInternaltPackages()
    {
      var a=[thi.type]
      try{
        a=a.concat(this.driver.geInternaltPackages())
      }catch(exp){}
      return a
      
    }
}