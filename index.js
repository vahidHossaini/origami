var dist =new (require('./distributer/index'))()
var remotes={}
global.auth={}
global.authz={}
global.captcha={} 
var fs=require('fs')
module.exports = class origami
{
    constructor(config,sa)
    {
        this.config=config
        this.sa=sa
    }
    start()
    {   
        for(var a of this.config)
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
                new (require('./'+a.name+'/index'))(a,dist)
            
        }
        
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
}
