var dist =new (require('./distributor/index'))()
var remotes={}
global.auth={}
global.authz={}
global.captcha={} 
global.upload={} 
var fs=require('fs')
module.exports = class origami
{
    constructor(config,reload) 
    {
        this.config=config
        this.reloadData=reload
        this.modules=[]
        this.modulesId={}
		
        global.authz={}
        global.auth={}
		
		
		global.consoleColor={
		  red:"\x1b[31m%s\x1b[0m",
		  green:"\x1b[32m%s\x1b[0m",
		  yellow:"\x1b[33m%s\x1b[0m",
		  blue:"\x1b[34m%s\x1b[0m",
		  white:"\x1b[37m%s\x1b[0m",
		  cyan:"\x1b[36m%s\x1b[0m",
		}
    }
    reload()
    {
        var nconfig=this.reloadData()
        console.log('begin Reload Project')
        for(var a of nconfig)
        {
            if(a.id)
            {
                if(this.modulesId[a.id])
                {
                    //console.log('reload exist project : '+a.name)
                    if(this.modulesId[a.id].reload)
                        this.modulesId[a.id].reload(a)
                }
                else
                {
                    console.log('add new : '+a.name)
                    this._loadModule(a)
                }
            }
        }
        for(var a of this.modules)
        {
            if(a.id)
            {
                var ex=nconfig.filter(p=>p.id==a.id)
                if(!ex.length)
                {
                    if(a.clear)
                        a.clear()
                    for(var b=0;b<this.modules.length;b++)
                    {
                        var x=this.modules[b]
                        if(x.id==a.id)
                        {

                            delete this.modulesId[a.id]
                            this.modules.splice(b,1)
                            break;
                        }
                    }    
                }
            } 
        }
    }

    async _loadModule(a)
    { 
		console.log('load module------>',a.name,'-',a.type)   
        if(a.servers)
        {
             
            dist.setServer(a.domain,a.servers)
            new (require('./'+a.name+'/index'))(a,dist)

            // var s=a.server
            // var name=s.address+s.port+s.type+s.mode
            // if(!remotes[name])
                // remotes[name]=new (require('./distributer/remote'))()
            
            // new (require('./'+a.name+'/index'))(a,remotes[name])
        }
        else
        {
			
            var m=new (require('./'+a.name+'/index'))(a,dist)
            if(m.Init)
				await m.Init();
			this.modules.push(m)
            if(a.id)
            {
                this.modulesId[a.id]=m
            }
        }
    }
    async start()
    {   
        for(var a of this.config)
        {
            await this._loadModule(a)
        } 
        // var chokidar=require('chokidar')
        // var watcher = chokidar.watch(process.cwd()+'\\livelog.txt', {ignored: /^\./, persistent: true});
        // watcher.on('change', (path)=> {
            // this.reload()
            
        // })

        
    }
    getPackages()
    {
        var p =[]
        for(var a of this.config)
        {
            if(!a.servers) 
            {
                try{
                    var conf = new (require('./'+a.name+'/config'))(a)
                    p=p.concat(conf.getPackages())

                }
                catch(exp){
                   // console.log('not found '+a.name)
                }
            } 
        }
        return p
    }
    getVersion()
    {
        var pjson = require('./package.json');
        return pjson.version
    }
    geInternaltPackages()
    {
        var p =[]
        for(var a of this.config)
        {
            if(!a.servers) 
            {
                try{
                    if(a.name=='module')
                        p.push(a.type)   
                    var conf = new (require('./'+a.name+'/config'))(a)
                    p=p.concat(conf.geInternaltPackages())

                }
                catch(exp){
                   // console.log('not found '+a.name)
                }
            } 
        }
        return p

    }
}
