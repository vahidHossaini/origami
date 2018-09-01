var srv=require('../service/index')
var fs=require('fs')
module.exports = class moduleService
{
    constructor(config,dist)
    {
      if(!fs.existsSync(global.path+'\\origami-modules\\'))
      {
        console.log('module'+config.type+' not found ')
        return
      }
      var p=global.path+'\\origami-modules\\'+config.type+'\\'
      var boot=new (require(p+'bootstrap.js'))(config)
      var conf={
        domain:config.type,
        driver:p+'index.js',
        structure:p+'struct.js',
        funcs:boot.funcs,
        auth:boot.auth,
        statics:config.config
      } 
      this.svc=new srv(conf,dist)
        //this.config=config

        //this.context=config.context
    }
}