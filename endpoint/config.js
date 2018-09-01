
module.exports = class databaseConfig
{
    constructor(config)
    {
        this.config=config
    }
    getPackages()
    {
        var p=[]
        if(this.config.telegram && this.config.telegram.length)
        {
            p.push('url')
            p.push('uuid')
            p.push('node-telegram-bot-api')
        }
        if(this.config.socket && this.config.socket.length)
        {
            p.push("uuid")
            p.push("websocket")
            p.push("connect-redis")
            for(var a of this.config.socket)
            {
                p.push(a.mode)
            }
        }
        if(this.config.express && this.config.express.length)
        {
            p.push("url")
            p.push("express")
            p.push("cookie-parser")
            p.push("body-parser")
            p.push("express-session")
            p.push("captchapng")
            p.push("path")
            p.push("connect-redis")
            
            for(var a of this.config.express)
            {
                if(a.decodeUrl)
                {
                    p.push("crypto")
                    break
                }
            }
        }
        return p
    }
    
    getVersionedPackages()
    { 
        var p=[]
        if(this.config.telegram && this.config.telegram.length)
        { 
            p.push('uuid@3.3.2')
            p.push('node-telegram-bot-api')
        }
        if(this.config.socket && this.config.socket.length)
        {
            p.push("uuid@3.3.2")
            p.push("websocket@1.0.26")
            p.push("connect-redis@3.3.3")
            for(var a of this.config.socket)
            {
                p.push(a.mode)
            }
        }
        if(this.config.express && this.config.express.length)
        { 
            p.push("express@4.16.3")
            p.push("cookie-parser@1.4.3")
            p.push("body-parser")
            p.push("express-session@1.15.6")
            p.push("captchapng@0.0.1") 
            p.push("connect-redis@3.3.3")
            
            for(var a of this.config.express)
            {
                if(a.decodeUrl)
                {
                    p.push("crypto")
                    break
                }
            }
        }
        return p
    }
}