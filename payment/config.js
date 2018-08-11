
module.exports = class databaseConfig
{
    constructor(config)
    {
        this.config=config
    }
    getPackages()
    {
        var p=['superagent'] 
        return p
    }
    
    getVersionedPackages()
    {
        var p=['superagent@3.8.3']
        return p
    }
}