
module.exports = class databaseConfig
{
    constructor(config)
    {
        this.config=config
    }
    getPackages()
    {
        var p=['sharememory','binary-file']
        return p
    }
    
    getVersionedPackages()
    { 
        var p=['sharememory@0.0.2','binary-file@0.2.1']
        return p
    }
}