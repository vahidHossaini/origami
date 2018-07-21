var dist =new (require('./distributer/index'))()
var remotes={}
global.auth={}
global.authz={}
global.captcha={}
var WebSocketServer = require('websocket').server;
module.exports = class origami
{
  constructor(config,sa)
  { 
    if(sa)
    {
          if(sa.type=='socket')
          {
                var mode=require(sa.mode);
                var server = mode.createServer(function(request, response) {
                    response.writeHead(404);
                    response.end();
                    
                });
                server.listen(sa.port, function() {
                    console.log(  'Socket Server is listening on port '+sa.port+' '+sa.mode);
                });
                var wsServer = new WebSocketServer({
                    httpServer: server,
                    autoAcceptConnections: false
                });
                
                wsServer.on('request', (request)=> {
                    var connection = request.accept('echo-protocol', request.origin);
                    
                    connection.on('message', (message)=> {
                        if (message.type === 'utf8'){
                            var data=JSON.parse(message.utf8Data)
                            if(!data.domain || !data.service)
                            {
                                connection.sendUTF(JSON.stringify({err:'not found'}));
                            } 
                            var body=data.param
                            if(!body.data)
                                body.data={}
                            dist.run(data.domain,data.service,body,(err,dd)=>{
                                var obj={
                                    error:err,
                                    data:dd
                                } 
                        console.log('---',obj)
                                if(data.id)
                                    obj.id=data.id
                                connection.sendUTF(JSON.stringify(obj));
                            })
                                    
                        }
                    })
                })
          }
    }
    for(var a of config)
    {
        if(a.servers)
        {
             
            dist.setServer(a.domain,a.servers)
            new (require('./'+a.name+'/index'))(a,dist)
            // var s=a.server
            // var name=s.address+s.port+s.type+s.mode
            // if(!remotes[name])
                // remotes[name]=new (require('./distributer/remote'))()
            
            // new (require('./'+a.name+'/index'))(a,remotes[name])
        }
        else
            new (require('./'+a.name+'/index'))(a,dist)
        
    }
  }
}
