var fs = require('fs');
var uuid = require('uuid');
//var http = require('http');
var WebSocketServer = require('websocket').server;
var session={}
module.exports=class socket
{
    constructor(config,dist)
    {
        var server={}
        //http https
        this.dist=dist
        var mode=require(config.mode);
        var server = mode.createServer(function(request, response) {
             console.log(  ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
            
        });
        server.listen(config.port, function() {
            console.log(  ' Server is listening on port '+config.port+' '+config.mode);
        });
        var wsServer = new WebSocketServer({
            httpServer: server,
            autoAcceptConnections: false
        });
        wsServer.on('request', (request)=> {
            var connection ={}
            console.log(Object.keys(request))
            try{
                connection = request.accept('echo-protocol', request.origin);
                 
                 if(config.protocol=='echo-protocol')
                 {
                    connection.on('message', (message)=> {
                        this.echoProtocolMessage(message,connection,request.key)
                    })
                 }
               
                connection.on("close",()=>{
                    this.echoClose(connection,request.key)
                })
                
            }catch(exp){
                
            }
        })
    }
    echoProtocolMessage(message,connection,key)
    {
        //console.log(request.key)  
        if (message.type === 'utf8')
        {
            try{
                var data=JSON.parse(message.utf8Data)
                if(!data.domain || !data.service)
                    this.response({message:"wrong service"},{id:data.id},connection)
                
                this.getSession(key,(session)=>{
                    
                    var body={
                        session:session,
                        data:data.param
                    }
                    this.dist.run(data.domain,data.service,body,(ee,dd)=>{
                        this.response(ee,dd,connection,key)
                    })
                })
            }
            catch(exp)
            {
                console.log(exp)
                this.response({message:'Json Support'},{},connection,key)                
            }
        }
        else
        {
            this.response({message:'not support'},{},connection,key)
            
        }
    }
    getSession(key,func)
    {
        return func({})
    }
    setSession(key,value,func)
    {
        
    }
    response(err,data,connection,key)
    {
        console.log(err)
        console.log(data)
        if(data &&  data.session)
            this.setSession(key,data.session,()=>{})
        var obj={
            error:err,
            data:data
        }
        connection.sendUTF(JSON.stringify(obj));
    }
    echoClose(connection,key)
    {
        if(session[key])
            delete session[key]
    }
}