var fs=require('fs')
var url = require('url');
var Promise = require('promise');
var TelegramBot = require('node-telegram-bot-api');
var teType=require('../enums/type.js')
class botStorage{
    constructor(config,dist)
    {
        this.context=config.context
        var bot = new TelegramBot(config.apiKey, { polling: false });
        this.bot=bot
        this.botName=config.botName
    }
    getelement(msg){
        console.log('GetElement',msg)
        if(msg.photo)
        {
            return ({id:msg.photo[msg.photo.length-1].file_id,type:teType.Photo})
        }
        if(msg.document)
        {
            return ({id:msg.document.file_id,type:teType.Document})
            
        }
        if(msg.video)
        {
            return ({id:msg.video.file_id,type:teType.Video})
            
        }
        if(msg.audio)
        {
            return ({id:msg.audio.file_id,type:teType.Audio}) 
        }
    }
    _send(type,chatid,path,func)
    { 
        //console.log('bot storage')
        //console.log(this.bot)
       
        return new Promise( (resolve, reject)=> {
            if(type==teType.Photo)
            {
                this.bot.sendPhoto(chatid,path)
                .then((msg)=>{ 
                    this.bot.deleteMessage(chatid,msg.message_id);resolve(this.getelement(msg)  );})
                .catch((data)=>{
                    console.log('EXP>>>',data)
                    resolve()})
            }
            else if(type==teType.Audio)
            {
                this.bot.sendAudio(chatid,path)
                .then((msg)=>{
                   // console.log(msg)
                    this.bot.deleteMessage(chatid,msg.message_id);resolve(this.getelement(msg));})
                .catch((data)=>{
                    console.log('EXP>>>',data)
                    resolve()})
            }
            else if(type==teType.Document)
            {
                this.bot.sendDocument(chatid,path)
                .then((msg)=>{this.bot.deleteMessage(chatid,msg.message_id);resolve(this.getelement(msg));})
                .catch((data)=>{
                    console.log('EXP>>>',data)
                    resolve()})
            }
            else if(type==teType.Video)
            {
                this.bot.sendVideo(chatid,path)
                .then((msg)=>{
                  //  console.log(msg)
                    this.bot.deleteMessage(chatid,msg.message_id);resolve(this.getelement(msg));})
                .catch((data)=>{ console.log('error -----'+data);resolve()})
            }
            else if(type==teType.Sticker)
            {
                this.bot.sendSticker(chatid,path)
                .then((msg)=>{this.bot.deleteMessage(chatid,msg.message_id);resolve(this.getelement(msg));})
                .catch((data)=>{
                    console.log('EXP>>>',data)
                    resolve()})
            }
            else
                func({code:404})
        })
    }
    async _getAddress(data)
    {
        var ids=data.chatid
        if(!Array.isArray(data.chatid))
            ids=[data.chatid]
        for(var a of ids)  
        {
            var dt = await this._send(data.fileType,a,data.path)
            
        console.log('IMG Send' ,dt )
            if(dt)
                return  dt 
        }            
        return ""
    }
    async _getFile(data,cache)
    {
        //console.log('_getFile',cache)
        if(cache)
        {
            var dd= await global.db.Search(this.context,'telegramCache',
                                {where:{$and:[{botName:this.botName},
                                {path:data.path}]}},{})
           // console.log('_getFile',dd)
           if(dd && dd.value && dd.value.length>0)
            {
                return  dd.value[0] 
            }
        }
        var img = await this._getAddress(data)
        console.log('IMG ' ,img )
        var dt={botName:this.botName,path:data.path,telegramPath:img.id,type:img.type}
        await global.db.Save(this.context,'telegramCache',['botName','path'],dt) 
        return dt
    }
    Upload(data,cache,func)
    {
        if(func)
        {
            this._sendFile(data,cache,func)
        }
        else{
            return new Promise( (resolve, reject)=> {
                this._sendFile(data,cache,(err,data)=>{
                    if(err)
                        reject(err)
                    else
                        resolve(data)
                })
            })
        }
    }
}
module.exports = class butrunner
{
    constructor(config,dist)
    {
        this.config=config
        try{
            this.storage=new botStorage(config)
            this.driver=new (require(config.driver))(config,dist,teType) 
        }
        catch(exp)
        {
            console.log(exp )
            console.log(config.domain + ' Bot Driver Error')
        }
        try{
            this.conf= JSON.parse(fs.readFileSync(config.configFile)) 
        }
        catch(exp)
        {
            console.log(exp)
            console.log(config.domain + ' Bot configFile Error')
        }
        
        dist.addFunction(config.domain,'onMessage',this.onMessage,this)
        dist.addFunction(config.domain,'onCallback',this.onCallback,this)
        dist.addFunction(config.domain,'onInline',this.onInline,this)
    }
    onInline(msg,func,self)
    {
        var dt = msg.data 
        var session=msg.session 
        var param=msg.query
        return self.driver.inline(dt,session,param,  (e,d)=>{
            if(d && !d.chatid)
                d.chatid=dt.from.id
            func(e,d)
        })
    }
    onCallback(msg,func,self)
    {
        var dt = msg.data 
        var session=msg.session 
        var url_parts = url.parse('z?'+dt.data, true);
        var param=url_parts.query
        console.log('--------------------')
        //console.log(param)
        console.log('session : ',session)
        //console.log(param.b)
        var st=param.b
        if(!st)
            st=session.state
        //console.log('GETST',st)
        if(!self.conf.states[st])
            return func({message:'state not found'})
        if(!st )
            return self.driver.start(dt,session,{},func)
        //console.log(self.conf)
        var des=self.conf.inputs[st][param.a]
        //console.log('DESTEn',des)
        if(des)
        {
            //console.log(des)
            //console.log(self.driver[des])
            if(self.driver[des])
                return self.driver[des](dt,session,param,  (e,d)=>{
                    
            console.log(des)
                    if(d &&  !d.chatid)
                        d.chatid=dt.from.id
                    if(e)
                        console.log('ERROR',e)
                    self.sendRes(e,d,des,func)
                })
            return func({message:'notFound'})    
        }
    }
    notFound(self,startcommand,dt,session,func)
    {
        return self.driver[startcommand](dt,session,{},(e,d)=>{
                        if(d &&  !d.chatid)
                            d.chatid=dt.from.id
                self.sendRes(e,d,startcommand,func)
                
            })
        
    }
    onMessage(msg,func,self)
    {
        var dt = msg.data 
        var session=msg.session 
        
        var startcommand='start' 
        for(var a of self.config.commands)
        {  
            if(a.name.indexOf(startcommand)>=0)
            {
                startcommand=a.func
                break
            }
        }
        for(var a of self.config.commands)
        {
            if(dt.text.indexOf(a.name)==0)
                return self.driver[a.func](dt,session,{},(e,d)=>{
                        if(d &&  !d.chatid)
                            d.chatid=dt.from.id
                    self.sendRes(e,d,a.func,func)
                    
                })
        }
            
        if(!session || !session.state)
            return self.notFound(self,startcommand,dt,session,func) 
        let param={input:dt.text}        
        var st= session.state 
        if(!self.conf.states[st])
            return func({message:'state not found'})  
        if(self.conf.inputs[st][dt.text])    
        {
            var des=self.conf.inputs[st][dt.text]
            
            if(self.driver[des])
                return self.driver[des](dt,session,param,  (e,d)=>{
                    if(d &&  !d.chatid)
                        d.chatid=dt.from.id
                    if(e)
                        console.log('ERROR',e)
                    self.sendRes(e,d,des,func)
                })
            return self.notFound(self,startcommand,dt,session,func) 
        }
        else if(self.conf.inputs[st]['$'])
        {
            let des=null
            for(var a of self.conf.inputs[st]['$'])
            {
                if(a.type=='int')
                {
                    try{
                        let n=parseInt(dt.text)
                        param={input:n}  
                        des=a.go   
                    }catch(exp){}
                }
                else if(a.type=='float')
                {
                    try{
                        let n=parseFloat(dt.text)
                        param={input:n}  
                        des=a.go   
                    }catch(exp){}
                }
                else{
                        param={input:dt.text}  
                    console.log('>>>Inputs',param)
                    des=a.go 
                }
            }
            if(des)
            {
                if(self.driver[des])
                    return self.driver[des](dt,session,param,  (e,d)=>{
                        if(d &&  !d.chatid)
                            d.chatid=dt.from.id
                        if(e)
                            console.log('ERROR',e)
                        self.sendRes(e,d,des,func)
                    })
                return self.notFound(self,startcommand,dt,session,func) 
            }
            else
            {
                return self.notFound(self,startcommand,dt,session,func) 
            }
        }
        else 
            return self.notFound(self,startcommand,dt,session,func) 
        
    }
    async sendRes (e,d,des,func)
    {
        if(d)
        {
            if(d.session)
                d.session.push({name:'state',value:des})
            else
                d.session=[{name:'state',value:des}]
            //console.log('>>>>>>>>>>>>>>>>>',d.session)
            if(d.path)
            {
                d.telegramFile = await this.storage._getFile(d,d.cache)
            }    
        }    
        //console.log('DATA',d)
        func(e,d)
    }
}