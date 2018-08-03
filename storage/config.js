
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
}