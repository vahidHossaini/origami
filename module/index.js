var srv=require('../service/index')
var fs=require('fs')
const { exec,spawn  } = require('child_process');

var runCommand=(command)=>{
    return new Promise((res,rej)=>{
            exec(command, (err, stdout, stderr) => {
              if (err) { 
                rej(err)
                return;
              }
              res(stdout)
              //console.log(stdout);
            }); 
    })
}
var install=(name,version,isGlobal)=>{
    return new Promise(async(res,rej)=>{ 
        try{ 

            var a =await runCommand(`node -e "require('${name}')"`) 
            res()
        }
        catch(exp)
        { 
            var x='npm install --save '
            if(isGlobal)
                x+= ' -g '
			var v=name
			if(version)
				v+="@"+version
            console.log('install ->', v)    
            exec(x+v, (err, stdout, stderr) => {
              if (err) {
                //console.error(err);
                rej(err)
                return;
              }
              res()
              //console.log(stdout);
            });
        }
        
    })
}

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
	async loadNpmConfig(config,dist)
	{
		await install("ori"+this.config.type)
		var conf=new (require("ori"+this.config.type+"/config.js"))(config.config);
		var modules=conf.getPackages(config.config)
		for(var a of modules)
		{
			await install(a.name,a.version)
		}
		
		var index = new (require("ori"+this.config.type))({statics:config.config},dist);
		var bt=new index.bootstrap(config.config)
		var domain=config.type;
        
        for(var a of bt.funcs)
		{
			if(a.upload)
            {
                if(!global.upload[domain])global.upload[domain]={}
				global.upload[domain][a.name]=a.upload;
            }
			
			dist.addFunction(domain,a.name, index[a.name],index,a.inputs)
		} 
        global.authz[domain]=bt.funcs
        global.auth[domain]={}
        for(var x of bt.auth)
        {
            if(typeof(x)=='string')
                global.auth[domain][x]='public'
            else
                global.auth[domain][x.name]=x.role
        }
		if(index.enums)
			this.dist.setClass(domain,index.enums)
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
	async Init()
	{
	  if(this.config.isNpm)
	  {
		  await this.loadNpmConfig(this.config,this.dist)
	  }
	  else
	  {
		this.loadConfig()
	  }
		
	}
    constructor(config,dist)
    {
      this.config=config
      this.dist=dist 
    }
}