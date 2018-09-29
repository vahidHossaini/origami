var srv=require('../service/index')
var fs=require('fs')
module.exports = class moduleService
{
    reload(config)  
    {
      if(JSON.parse(JSON.stringify(config))!=JSON.parse(JSON.stringify(this.config)))
      {  
        if(this.svc.clear)
          this.svc.clear()
        this.config=config
        this.loadConfig()
      }
      
    }
    clear()
    {
        if(this.svc.clear)
          this.svc.clear()

    }
    loadConfig()
    {
      if(!fs.existsSync(global.path+'/origami-modules/'))
      {
        console.log(global.consoleColor.red,'module'+this.config.type+' not found ')
        return
      }
      var p=global.path+'/origami-modules/'+this.config.type+'/'
      var boot=new (require(p+'bootstrap.js'))(this.config)
      var conf={
        domain:this.config.type,
        driver:p+'index.js',
        structure:p+'struct.js',
        funcs:boot.funcs,
        auth:boot.auth,
        statics:this.config.config
      } 
      this.svc=new srv(conf,this.dist)
    }
    constructor(config,dist)
    {
      this.config=config
      this.dist=dist 
      this.loadConfig()
    }
}