

module.exports = class databaseConfig
{
    constructor(config)
    {
        this.config=config
    }
    getPackages()
    {
        var p=[]
        if(this.config.requires)
        {
            p=this.config.requires
        }
        p.push('uuid')
        return p
    }
    
    getVersionedPackages()
    {
        var p=[]
        if(this.config.requires)
        {
            p=this.config.requires
        }
        p.push('uuid@3.3.2')
        return p 
    }
}