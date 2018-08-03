
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
            for(var a of this.config.socket)
            {
                p.push('config.mode')
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