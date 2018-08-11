
module.exports = class databaseConfig
{
    constructor(config)
    {
        this.config=config
    }
    getPackages()
    {
        var p=['eval']
        return p
    }
    
    getVersionedPackages()
    {
        var p=['eval@0.1.2']
        return p
    }
}