var dist =new (require('./distributer/index'))()
var remotes={}
global.auth={}
global.authz={}
global.captcha={} 
var fs=require('fs')
module.exports = class origami
{
    constructor(config,reload) 
    {
        this.config=config
        this.reloadData=reload
        this.modules=[]
        this.modulesId={}
    }
    reload()
    {
        var nconfig=this.reloadData()
        //console.log('reload Data')
        for(var a of nconfig)
        {
            if(a.id)
            {
                if(this.modulesId[a.id])
                {
                    if(this.modulesId[a.id].reload)
                        this.modulesId[a.id].reload(a)
                }
                else
                {
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

    _loadModule(a)
    {
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
            this.modules(m)
            if(a.id)
            {
                this.modulesId[a.id]=m
            }
        }
    }
    start()
    {   
        for(var a of this.config)
        {
            this._loadModule(a)
        } 
        var chokidar=require('chokidar')
        var watcher = chokidar.watch(process.cwd()+'\\livelog.txt', {ignored: /^\./, persistent: true});
        watcher.on('change', (path)=> {
            this.reload()
            
        })

        
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
