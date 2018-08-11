//var memory= require("C:\\project\\OrigamiCore\\shareMemory\\index.js").Server
var memory= {}
module.exports = class memoryService
{
    constructor(config,dist)
    {
        this.servers=[]
        memory= require("sharememory").Server
        for(var a of config.memServers)
        {
            this.servers.push(new memory(a.port))
        }
    }
}