
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
}