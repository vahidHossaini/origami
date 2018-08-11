
module.exports = class databaseConfig
{
    constructor(config)
    {
        this.config=config
    }
    getPackages()
    {
        var p=[]
        for(var a of this.config.driver)
        {
            if(a.type=='simple')
            {
                p.push('moment')
            }
            if(a.type=='redis')
            {
                p.push('uuid')
                p.push('redis') 
            }
        }
        return p
    }
    
    getVersionedPackages()
    { 
        var p=[]
        for(var a of this.config.driver)
        {
            if(a.type=='simple')
            {
                p.push('moment@2.22.2')
            }
            if(a.type=='redis')
            {
                p.push('uuid@3.3.2')
                p.push('redis@2.8.0') 
            }
        }
        return p
    }
}