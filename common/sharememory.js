
var WebSocketClient = require('websocket').client;
var allVars={}
module.exports = class shareMemory
{
    constractor(){}
    init(host,port,name,func)
    {
        this.changeEvent=func
        var client = new WebSocketClient();
        client.on('connectFailed', function(error) {
            console.log('>>>>Connect Error: ' + error.toString());
        });
        client.on('connect', (connection)=> { 
            this.connection=connection
            this.connection.sendUTF(JSON.stringify({type:'setup',name:name}));
                console.log('up and running')
            connection.on('error',(err)=>{
                console.log('error')
            })
            connection.on('message',(data)=>{
                console.log('-->',data)
                if(data.utf8Data)
                    data=JSON.parse(data.utf8Data)
                if(data.type=='setData')
                { 
                    allVars[data.n]=data.v
                    func(data.n,data.v)
                }
            })
        })
        client.connect('ws://'+host+':'+port+'/', 'echo-protocol');
    }
    setData(name,val)
    {
        allVars[name]=val
        this.connection.sendUTF(JSON.stringify({type:'setData',n:name,v:val}));
        
    }
    getData(name)
    {
        return allVars[name]
    }
}
