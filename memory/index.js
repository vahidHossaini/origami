var memory= require("C:\\project\\OrigamiCore\\shareMemory\\index.js").Server
//var memory= require("sharememory").Server
module.exports = class memoryService
{
    constructor(config,dist)
    {
        this.servers=[]
        for(var a of config.memServers)
        {
            this.servers.push(new memory(a.port))
        }
    }
}