
module.exports = class databaseConfig
{
    constructor(config)
    {
        this.config=config
    }
    getPackages()
    {
        var p=[]
        for(var a of this.config.connection)
        {
            if(a.type=='mongodb')
            {
                p.push('odata-v4-mongodb')
                p.push('assert')
                p.push('mongodb')
            }
            if(a.type=='mysql')
            {
                p.push('odata-v4-mysql')
                p.push('mysql') 
            }
        }
        return p
    }
    
    getVersionedPackages()
    {
        var p=[]
        for(var a of this.config.connection)
        {
            if(a.type=='mongodb')
            {
                p.push('odata-v4-mongodb@0.1.12') 
                p.push('mongodb@3.1.1')
            }
            if(a.type=='mysql')
            {
                p.push('odata-v4-mysql')
                p.push('mysql') 
            }
        }
        return p 
    }
}