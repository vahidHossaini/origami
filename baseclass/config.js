
module.exports = class databaseConfig
{
    constructor(config)
    {
        this.config=config
    }
    getPackages()
    {
        var p=['jalaali-js']
        
        return p
    }
    getVersionedPackages()
    {
        var p=['jalaali-js@1.1.0']
        return p
    }
}