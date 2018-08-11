module.exports = class databaseConfig
{
    constructor(config)
    {
        this.config=config
    }
    getPackages()
    {
        var p=[]
        for(var a of this.config.drivers)
        {
           if(a.type=='email')
           {
               p.push('nodemailer')
           }
           if(a.type=='webService')
           {
               if(a.protocol=='http')
               {
                   p.push('http')
                   p.push('http-post')
               }
               if(a.protocol=='https')
               {
                   p.push('https')
                   p.push('https-post')
               }
           }
        }
        return p
    }
    
    getVersionedPackages()
    { 
        var p=[]
        for(var a of this.config.drivers)
        {
           if(a.type=='email')
           {
               p.push('nodemailer')
           }
           if(a.type=='webService')
           {
               if(a.protocol=='http')
               { 
                   p.push('http-post@0.1.1')
               }
               if(a.protocol=='https')
               { 
                   p.push('https-post')
               }
           }
        }
        return p
    }
}