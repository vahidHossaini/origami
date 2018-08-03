
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
}