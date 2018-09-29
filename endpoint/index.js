
module.exports = class endpoint
{
    
    reload(config)  { 
        if(JSON.parse(JSON.stringify(config))==JSON.parse(JSON.stringify(this.config)))
        {
            return
        }
        if( JSON.stringify(config.express) != JSON.stringify(this.config.express) )
        { 
            this.clearExpressDriver()
            if(config.express)
            {
                for(var a of config.express)
                {
                    var exp=new(require('./express.js'))(a,this.dist)  
                    this.expressDriver.push(exp) 
                }
            }
        }
        
        if(config.socket || this.config.socket) 
            if((!config.socket && this.config.socket) || (config.socket && !this.config.socket) || JSON.stringify(config.socket)!=JSON.stringify(this.config.socket))
            {
                this.clearSocketDriver()
                if(config.socket)
                {
                    for(var a of config.socket)
                    {
                        var exp=new(require('./socket.js'))(a,this.dist)              
                        this.socketDriver.push(exp)
                    }
                }
            }
        
    }
    clear()
    {
        this.clearExpressDriver()
        this.clearSocketDriver()
    }
    clearExpressDriver()
    {
        for(var a of this.expressDriver)
            a.clear()
        this.expressDriver=[]
    }
    clearSocketDriver()
    {
        for(var a of this.socketDriver)

            a.clear()
        this.socketDriver=[]
    }
     
    constructor(config,dist)
    {
        this.dist=dist
        this.config=config
        this.expressDriver=[]
        this.socketDriver=[]
        if(config.express)
        {
            for(var a of config.express)
            {
                var exp=new(require('./express.js'))(a,dist)  
                this.expressDriver.push(exp) 
            }
        }
        if(config.telegram)
        {
            for(var a of config.telegram)
            {
                var exp=new(require('./telegram.js'))(a,dist) 
            }
        }
        if(config.socket)
        {
            for(var a of config.socket)
            {
                var exp=new(require('./socket.js'))(a,dist)              
                this.socketDriver.push(exp)
            }
        }
    }
}
