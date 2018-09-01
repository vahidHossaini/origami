var crypto = {}
var url = require('url');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var captchapng = require('captchapng');
var path = require('path'); 
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function Getrand(n=12)
{
    var str=''
    var sr='1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
    for(var a=0;a<n;a++)
    {
        var i=getRandomArbitrary(0,sr.length)
        str+=sr[i]
    }
    return str
}
function GetrandInt(n=12)
{
    var str=''
    var sr='23456890'
    for(var a=0;a<n;a++)
    {
        var i=getRandomArbitrary(0,sr.length)
        str+=sr[i]
    }
    if(str[0]=='0')
        str='1'+str
    return parseInt(str)
}


module.exports=class newExpr
{
    async checkCaptcha(data,req,dt)
    {
        return new Promise((res,rej)=>{
            var cha=global.captcha[dt.domain]
            var valid=false
            if(cha && cha[dt.service])
            {
                if(req.session.captcha)
                    if(data.captchacode==req.session.captcha)
                    {
                        valid=true
                    } 
                req.session.captcha= new captchapng(80,30,GetrandInt(5))
            }
            else
            {
                valid=true
            }
            return res(valid)
        })
    }
    async checkAuthz(session,dt,dist,authz)
    { 
        return new Promise( async(res,rej)=>{            
            if(session && session.superadmin)
                return res(true)
            
            dist.run(authz.domain,'checkRole',{data:{domain:dt.domain,service:dt.service},session:session},(ee,dd)=>{
                if(ee)
                    return res(false)
                return res(dd)
            })
        })
    }
    sendData(self,res,status,data)
    {
        var config=self.config
        if( config.decodeUrl)
        {
            var mykey = crypto.createCipher(config.decodeUrl.algorithm, config.decodeUrl.passwpord);
            var mystr = mykey.update(JSON.stringify(data), 'utf8', 'hex')
            mystr += mykey.final('hex');
            return res.status(status).send(mystr)
        }
        else
        {
            return res.status(status).send(data)
            
        }
    }
    setPublic(app,config)
    {
        var pb=config['public']
        if(!Array.isArray(pb))
        {
            pb=[pb]
        }
        for(var a of pb)
        {
            if(typeof(a)=="string")
            {
                app.use(express.static(path.join(global.path,a)));
            }
        }
    }
    setCrossDomain(app,config)
    { 
        if(config.CrossDomain)
            app.use(function (req, res, next) {
            if ('OPTIONS' == req.method) {
                if(config.CrossDomain=='*')
                    res.header('Access-Control-Allow-Origin', req.headers.origin);
                else
                    res.header('Access-Control-Allow-Origin', config.CrossDomain);
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.status(200).send('OK');
            }
            else
            {
                next()
            }
            });
    }
    setSessionMaager(app,config)
    {
        if(config.sessionManager)
        {
            app.use(cookieParser());
            var RedisStore = require('connect-redis')(session);
            var objsession={host:config.sessionManager.connection.host,
                    port:config.sessionManager.connection.port,}
            if(config.sessionManager.connection.pass)    
            {
                objsession.pass=config.sessionManager.connection.pass
            }    
            app.use(session({
                store: new RedisStore( objsession),
                secret: 'keyboard cat' ,
                resave: true,
                saveUninitialized: true
            }));
        }    
        else
        {    
          app.use(session({
              resave: true,
              saveUninitialized: true,
              secret: 'keyboard cat',
              cookie: { maxAge: 6000000 }
            })) 
        }   
    }
    setCaptcha(app,config)
    {
        app.get('/captcha.png',(req, res)=>{   
            var rand=GetrandInt(5)
            var p = new captchapng(80,30,rand); // width,height,numeric captcha
            p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
            p.color(80, 80, 80, 255);
            req.session.captcha=rand
            var img = p.getBase64();
            var imgbase64 = new Buffer(img,'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png'
            });
            res.end(imgbase64);
        }) 
    }
    setUrlParser(app,config)
    {
        if(config.decodeUrl)
        {
            crypto= require('crypto');
            app.use(function (req, res, next){
                var url_parts = url.parse(req.url, true); 
                var path=url_parts.pathname.substr(1)
                try{
                    var mykey = crypto.createCipher(config.decodeUrl.algorithm, config.decodeUrl.passwpord);
                    let mystr = mykey.update(path, 'hex','utf8' )
                    mystr += mykey.final('utf8');
                    let obj=JSON.parse(mystr)
                    req.url='/'+obj.d+'/'+obj.s
                    req.body=obj
                    next()
                }catch(exp){
                    return res.status(200).send(Getrand(30))
                }
            })
            
        }
        else{
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({extended: true}));
            if(config.bodyLimit)
                app.use(bodyParser.json({limit: config.bodyLimit*1026*1024}));
            if(config.urlLimit)
                app.use(bodyParser.urlencoded({limit: config.urlLimit*1026*1024,extended: true}));
            
        }
    }
    runServer(app,config)
    {
        if(config.http)
        {
            var http = require('http');
            var server = http.createServer(app);
            server.listen(config.http.port);
            console.log(global.consoleColor.green,'http run at port '+ config.http.port)
        }
        if(config.https)
        {
            var http = require('https');
            var server = http.createServer(app);
            server.listen(config.https.port);
            console.log(global.consoleColor.green,'http run at port '+ config.https.port)
        }
    }
    reqToDomain(config,req,self,res)
    {
        var url_parts = url.parse(req.url, true); 
        var seperate = url_parts.pathname.split('/')
        if(!seperate || seperate.length!=3)
        {
            self.sendData(self,res,200,{message:'glb001'})
            return
        }  
        var rt={
            domain:seperate[1],
            service:seperate[2]
        }
        var session = req.session;
        var body={
            session:session,
        }
        if(req.method=='GET')
        {
            body.data = url_parts.query;
            if(req.body)
                for(var a in req.body){
                    body.data[a]=req.body[a] 
            }
        }
        else
        {
            body.data=req.body 
            var bx = url_parts.query; 
            for(var a in bx)
            {
                body.data[a]=bx[a]
            } 
        }
        rt.body=body
        return rt
    }
    constructor(config,dist)
    {
        var self=this
        self.config=config
        this.dist=dist
        var app = express();
        app.set('trust proxy', 1)
        this.setPublic(app,config)
        this.setCrossDomain(app,config)
        this.setSessionMaager(app,config)
        this.setCaptcha(app,config)
        this.setUrlParser(app,config)
        this.runServer(app,config)
        app.use(async(req, res, next)=> {
            var data = this.reqToDomain(config,req,self,res)
            if(!data)
                return
            var session = req.session;
            if(config.authz)
            {
                let isAuthz =await self.checkAuthz(session,data,dist,config.authz)
                if(!isAuthz) 
                    return self.sendData(self,res,200,{message:'glb002'})

            }
            var chp = await self.checkCaptcha(data.body.data,req,data)
            if(!chp) 
                return self.sendData(self,res,200,{message:'glb003'})
            try{
                var dd=await dist.run(data.domain,data.service,data.body)
                
                if(dd && dd.session && dd.session.length)
                {
                    for(var ses of dd.session)
                    {
                        if(ses.value==null)
                            delete req.session[ses.name]
                        else {
                            req.session[ses.name]=ses.value
                        }
                    }
                    delete dd.session
                }
                if(dd && dd.redirect)
                {
                    return res.redirect(dd.redirect)
                }
                if(dd && dd.directText)
                    return self.sendData(self,res,200,dd.directText)
                
                if(dd && dd.directFileDownload)
                {
                    fs.readFile(data.directFileDownload,function(err, data1){
                        //return  res.status(200).end(data1);
                        return  self.sendData(self,res,200,data1)
                    })
                    return
                }
  
              //return res.status(200).send({isDone:true,data:dd})
              return self.sendData(self,res,200,{isDone:true,data:dd})
            }catch(ee)
            {
                return self.sendData(self,res,200,ee)
            }

        })
    }
}