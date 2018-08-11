
module.exports = class databaseConfig
{
    constructor(config)
    {
        this.config=config
    }
    getPackages()
    {
        var p=['uuid']
        
        return p
    }
    getVersionedPackages()
    {
        var p=['uuid@3.3.2']
        return p
    }
}