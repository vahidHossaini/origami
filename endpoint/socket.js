var fs = require('fs');
var uuid = require('uuid');
//var http = require('http');
var WebSocketServer = require('websocket').server;
var session={}
var connections={ 
}
var userIds={ 
}
module.exports=class socket
{
    constructor(config,dist)
    {
        var server={}
        //http https
        this.config=config
        this.sm=config.sessionContext
        this.dist=dist
        //for publication
        if(config.publication)
        {
            this.pubcon=config.publication
            dist.run('publication','connect',{id:this.pubcon.id},(ee,dd)=>{
                //console.log('publication',ee)
                var key=userIds[dd.user]
                if(key && connections[key])
                    this.response(ee,dd,connections[key],key )
               // this.echoProtocolMessage(dd,connections[key],key)
            })
        }
        
        var mode=require(config.mode);
        var server = mode.createServer(function(request, response) {
            response.writeHead(404);
            response.end();
            
        });
        server.listen(config.port, function() {
            console.log(  'Socket Server is listening on port '+config.port+' '+config.mode);
        });
        var wsServer = new WebSocketServer({
            httpServer: server,
            autoAcceptConnections: false
        });
        wsServer.on('request', (request)=> {
            var connection ={}
            //console.log(Object.keys(request))
            try{
                connection = request.accept('echo-protocol', request.origin);
                 
                 connections[request.key]=connection
                 if(config.protocol=='echo-protocol')
                 {
                    connection.on('message', (message)=> {
                        this.echoProtocolMessage(message,connection,request.key)
                    })
                 }
               
                connection.on("close",()=>{
                      
                    delete connections[request.key]
                    this.echoClose(connection,request.key)
                })
                
            }catch(exp){
                console.log('Error>>>',exp)
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
                if(this.pubcon )
                {
                    if(!data.param)
                        data.param={}
                    data.param.pubid=this.pubcon
                    
                }
                if(!data.domain || !data.service)
                {
                    if(this.domain=='Login' && data.token && this.config.tokenBase )
                    {
                        session[key]=data.token
                        this.getSession(key,func)
                    }
                    else
                        this.response({message:"wrong service"},{id:data.id},connection)
                        
                    return
                }    
                if(this.config.tokenBase)
                {
                    key=session[key]
                }
                this.getSession(key,(session)=>{
                    //console.log('Session',session)
                    var body={ 
                        data:data.param
                    }
                    if(!body.data)
                        body.data={}
                    if(session)
                    {
                        //console.log('befor-----',session)
                        body.session=session.session
                    }
                    this.dist.run(data.domain,data.service,body,(ee,dd)=>{ 
                        this.response(ee,dd,connection,key,data.id)
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
            //console.log('Session',key)
        if(!key)
            return func({})
        global.sm.get(this.sm,key,(e,d)=>{
            
           // console.log('Session',e)
          //  console.log('Session',d)
            return func(d)
        })
    }
    setSession(key,values,func)
    {
        if(!key)
            return func({})
        global.sm.get(this.sm,key,(e,d)=>{
            let obj={}
            if(d)
                obj=d
            for(let a of values)
            {
                if(a.value==null)
                    delete obj[a.name]
                else
                    obj[a.name]=a.value
            }
            global.sm.set('redis',key,obj,(e,d)=>{
                return func(d)
            })
        })
         
        
    }
    response(err,data,connection,key,id)
    {
        //console.log(err)
        //console.log(data)
        if(!err && data)
            if(data.session)
                for(var a of data.session)
                {
                    //console.log('session is ---->',a)
                    if(a.name=='userid')
                    {
                        if( a.value)
                            userIds[a.value]=key
                        else
                            delete userIds[a.value]
                    //console.log('session is ---->',userIds)
                    }
                }
        if(data &&  data.session)
        { 
            this.setSession(key,data.session,()=>{})
        }
        //console.log(data)
        if(data)
            delete data.session 
        var obj={
            error:err,
            data:data
        }
        if(id)
            obj.id=id
        connection.sendUTF(JSON.stringify(obj));
    }
    echoClose(connection,key)
    {
        if(session[key])
            delete session[key]
    }
}