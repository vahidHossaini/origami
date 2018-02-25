var url = require('url');
var fs = require('fs');
var uuid = require('uuid');
var session={}
module.exports=class telegram
{
    constructor(config,dist)
    {
        var TelegramBot = require('node-telegram-bot-api');
        var bot = new TelegramBot(config.apiKey, { polling: true });
        this.bot=bot
        this.dist=dist
        this.config=config
        this.userKey=['id']
        this.context=config.context
        bot.on('inline_query',(msg)=>{ this.onInlineQuery(msg)})
        bot.on('message', (msg)=>{
            this.onGetMessage(msg)
        })
        bot.on('callback_query',(msg)=>{
            this.onCallbackQuery(msg)
        }  )
    }
    onInlineQuery(msg)
    {
        console.log('onInlineQuery')
        console.log(msg)
    }
    onGetMessage(msg)
    {
    console.log(msg)
        this.getUserid(msg.from.id,msg.from,(session)=>{
            var body={
                session:session,
                data:msg
            }
            this.dist.run(this.config.domain,'onMessage',body,(ee,dd)=>{
                this.sendResponse(ee,dd,msg)
            })
        }) 
    }
    //when button click
    onCallbackQuery(msg)
    { 
        this.getUserid(msg.from.id,msg.from,(session)=>{
            var body={
                session:session,
                data:msg
            }
            this.dist.run(this.config.domain,'onCallback',body,(ee,dd)=>{
                this.sendResponse(ee,dd,msg)
            })
        }) 
    }
    sendResponse(err,data,msg)
    {
        data.chatid=msg.from.id
        if(data.session)
            this.setSession(data.chatid,data.session)
        if(!data.notDelete && msg.message)
            this.bot.deleteMessage(data.chatid,msg.message.message_id) 
        if(data.type=='inline')
            this.sendInlineData(data)
    }
    sendInlineData(data)
    {
        var op={}
       // return console.log(data)
        if(data.keys)
            op.inline_keyboard=data.keys
        this.bot.sendMessage(data.chatid,data.text,{reply_markup:op})
    }
    getUserid(id,user,func)
    {
        if(session[id])
            return func(session[id]) 
        
        console.log('getuserid')
        console.log(id)
        //return
        global.db.Search(this.context,'telegramUsers',{where:{id:id}},{},(e,d)=>{
           
            if(d.value.length)
            {
                session[id]={userid:d.value[0].userid}
                return func(session[id]) 
            }
            var userid=uuid.v4()
            var obj={
                id:id,
                userid:userid,
                credit:0,
                username:user.username,
                firstName:user.first_name,
                lastName:user.last_name
            }
            
            global.db.Save(this.context,'telegramUsers',this.userKey,obj,(ee,dd)=>{ 
                session[id]={userid:userid}
                return func(session[id]) 
            })
            
        })
    }
    getSession(id)
    {
        
    }
    setSession(id,data)
    {
        if(!session[id])
            session[id]={}
        for(var a of data)
        {
            if(a.value!=null)
                session[id][a.name]=a.value
            else 
                delete session[id][a.name]
        }
    }
}