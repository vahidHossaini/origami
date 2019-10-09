var uuid={}
var WebSocketClient={} ;
var transport={}
module.exports = class clientService
{
    constractor(){
        uuid=require('uuid')
        WebSocketClient = require('websocket').client;
    }
	reply(msg)
	{
		var msg= JSON.parse(msg.content.toString());
		var domain=msg.domain;
		var service=msg.service;
		var r=this.dist.route;
		if(r[domain] &&r[domain][service])
		{
			var self=r[domain][subDomain].self
			r[domain][subDomain].func(msg.msg,(ee,dd)=>{
				var newmsg="";
				if(ee)newmsg=JSOB.stringify(ee);
				else newmsg=JSOB.stringify({isDone:true,data:dd});
				
				this.ch.sendToQueue(msg.properties.replyTo,
                     Buffer.from(newmsg),
                     {correlationId: msg.properties.correlationId});
			},self,r[domain][subDomain].domain);
		}
	}
    async init(srv,domain,dist)
    {
		this.dist=dist;
		
		if(srv.type=="RMQ")
		{
			var amqp = require('amqplib');
			var conn= await amqp.connect('amqp://'+srv.address);
			var ch = await conn.createChannel();
			var ok =await ch.assertQueue(domain, {durable: false});
			ch.prefetch(srv.maxFetch); 
			await ch.consume(domain, reply);
			this.ch=ch;
		}
		else
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
    }
    send(data)
    {
        return new Promise(  (resolve, reject) =>{ 
            data.id=uuid.v4() 
            transport[data.id]={id:data.id,resolve:resolve,reject:reject} 
            this.connection.sendUTF(JSON.stringify(data));
            
        })
        
    }
}