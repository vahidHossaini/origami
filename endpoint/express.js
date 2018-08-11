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
module.exports=class expr
{
  checkCaptcha(data,req,seperate,func)
  {
      var cha=global.captcha[seperate[1]]
      var valid=false
      if(cha && cha[seperate[2]])
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
      return func(valid)
  }
  checkAuthz(session,seperate,dist,func)
  {
      //superadmin
    if(session && session.superadmin)
        return func(true)
        var acc=global.auth[seperate[1]]
    if(acc && acc[seperate[2]])
    {
        if(acc[seperate[2]]=='login' && !session.userid)
            return func(false)
        return func(true)
    }    
    if(!session.userid)
    { 
        if(!acc ||(acc && !acc[seperate[2]]))
            return func(false)
    }
    dist.run('authz','checkRole',{data:{domain:seperate[1],subDomain:seperate[2]},session:session},(ee,dd)=>{
        if(ee)
            return func(false)
        return func(true)
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
  constructor(config,dist)
  {
      var self=this
      self.config=config
    this.dist=dist
    var app = express();
    app.set('trust proxy', 1)
    app.use(express.static(path.join(global.path, config['public'])));
    //console.log('public1--------------------',config['public1'])
    if(config['public1'])
        app.use(express.static(config['public1']));
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
    if(config.decodeUrl)
    {
        crypto= require('crypto');
//var mystr = mykey.update('{"d":"test","s":"test1","a":12}', 'utf8', 'hex')
//mystr += mykey.final('hex');

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
                
                //console.log(exp)
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
    if(config.http)
    {
        var http = require('http');
        var server = http.createServer(app);
        server.listen(config.http.port);

    }
    if(config.https)
    {
        var http = require('https');
        var server = http.createServer(app);
        server.listen(config.https.port);

    }
    app.use(function (req, res, next) {
        //console.log('BODY',req.body)
        console.log('URL',req.url)
        //console.log('method',req.method)
      if(config.CrossDomain)
      {
          
            if(config.CrossDomain=='*')
                res.header('Access-Control-Allow-Origin', req.headers.origin);
            else
                res.header('Access-Control-Allow-Origin', config.CrossDomain);
          res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
          res.setHeader('Access-Control-Allow-Credentials', true);
          res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
      }
      var url_parts = url.parse(req.url, true); 
      var seperate = url_parts.pathname.split('/')
        //self.sendData(self,res,)
      if(!seperate || seperate.length!=3)
        //return res.status(200).send({message:'glb001'})
        return self.sendData(self,res,200,{message:'glb001'})
        
        
      var session = req.session;
      
      
      self.checkAuthz(session,seperate,dist,(isAuthz)=>{
          if(!isAuthz)
            //return res.status(200).send({message:'glb002'})
            return self.sendData(self,res,200,{message:'glb002'})
              
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
          self.checkCaptcha(body.data,req,seperate,(cph)=>{
            if(!cph)
                //return res.status(200).send({message:'glb003'})
                return self.sendData(self,res,200,{message:'glb003'})
          
          dist.run(seperate[1],seperate[2],body,(ee,dd)=>{
            if(ee)
              //return res.status(200).send(ee)
              return self.sendData(self,res,200,ee)
            if(dd.session && dd.session.length)
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
            if(dd.redirect)
            {
              return res.redirect(dd.redirect)
            }
            if(dd.directText)
              //return res.status(200).send(dd.directText);
              return self.sendData(self,res,200,dd.directText)
              
            if(dd.directFileDownload)
            {
              fs.readFile(data.directFileDownload,function(err, data1){
                  //return  res.status(200).end(data1);
                  return  self.sendData(self,res,200,data1)
              })
              return
            }

            //return res.status(200).send({isDone:true,data:dd})
            return self.sendData(self,res,200,{isDone:true,data:dd})
          })
          
          })
        
      }) 
    
    })
  }
}
