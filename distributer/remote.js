var uuid=require('uuid')
var WebSocketClient = require('websocket').client;
var transport={}
module.exports = class clientService
{
    constractor(){}
    init(srv)
    {
        console.log('connect to --------------------------',srv)
        this.address=srv.address
        this.port=srv.port
        this.type=srv.type
        this.mode=srv.mode
        var client = new WebSocketClient();
        client.on('connectFailed', function(error) {
            console.log('===========Connect Error: ' + error.toString());
        });
        client.on('connect', (connection)=> {
            this.connection=connection
            connection.on('error',(err)=>{
                console.log('error')
            })
            connection.on('message',(data)=>{
                if(data.utf8Data)
                    data=JSON.parse(data.utf8Data)
                console.log('------------>>>>>>>>>>>>>--------------',data)
                if(data.id && transport[data.id])
                {
                    if(data.error)
                    {
                        transport[data.id].reject(data.error) 
                    }
                    else
                        transport[data.id].resolve(data.data)
                        
                }
            })
        })
        client.connect('ws://'+this.address+':'+this.port+'/', 'echo-protocol');
    }
    send(data)
    {
        return new Promise(  (resolve, reject) =>{
                //console.log('------------>>>>>>>>>>>>>--------------',this.connection)
            data.id=uuid.v4() 
            transport[data.id]={id:data.id,resolve:resolve,reject:reject}
                //console.log('------------>>>>>>>>>>>>>--------------',this.connection)
            this.connection.sendUTF(JSON.stringify(data));
            
        })
        
    }
}