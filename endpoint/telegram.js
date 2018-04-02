var url = require('url');
var fs = require('fs');
var uuid = require('uuid');
var session={}
var teType=require('../enums/type.js')
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
        //console.log('onInlineQuery')
        //console.log(msg)
        this.getUserid(msg.from.id,msg.from,(session)=>{
            var body={
                session:session,
                data:msg
            }
            this.dist.run(this.config.domain,'onInline',body,(ee,dd)=>{
                var arr=[]
                for(var a of dd.array)
                {
                    arr.push({
                        title:a.title,
                        id:a.id,
                        message_text:a.message,
                        reply_markup:{inline_keyboard:a.keys},
                        type:a.type
                    })
                }
                var dt={}
                if(dd.header)
                    dt.switch_pm_text=dd.header
                if(dd.param)
                    dt.switch_pm_parameter=dd.param
                //delete data.array
                this.bot.answerInlineQuery(msg.id,arr ,dt );
               // this.sendResponse(ee,dd,msg)
            })
        })
    }
    onGetMessage(msg)
    {
       // console.log('onGetMessage')
       // console.log(msg)
        this.getUserid(msg.from.id,msg.from,(session)=>{
            var body={
                session:session,
                data:msg
            }
            this.dist.run(this.config.domain,'onMessage',body,(ee,dd)=>{
               // console.log('ee>>',ee)
               // console.log('Error>>',dd)
                if(ee)
                    return this.bot.sendMessage(msg.from.id,ee.message)
                
                this.sendResponse(ee,dd,msg)
            })
        }) 
    }
    //when button click
    onCallbackQuery(msg)
    { 
        //console.log('onCallbackQuery')
        //console.log(msg)
        this.getUserid(msg.from.id,msg.from,(session)=>{
            var body={
                session:session,
                data:msg
            }
            this.dist.run(this.config.domain,'onCallback',body,(ee,dd)=>{
                if(ee)
                    return this.bot.answerCallbackQuery(msg.id,{text:'error',show_alert:false})
                if(dd.error)
                    return this.bot.answerCallbackQuery(msg.id,{text:dd.error,show_alert:true})
                this.sendResponse(ee,dd,msg)
                this.bot.answerCallbackQuery(msg.id,{text:'ok',show_alert:false})
            })
        }) 
    }
    sendResponse(err,data,msg)
    {
        //console.log('sendResponse',data)
        if(err)
            console.log('sendResponse',err)
        data.chatid=msg.from.id
        if(data.session)
            this.setSession(data.chatid,data.session)
        if((!data.life || data.life=='delete')&& msg.message)
            this.bot.deleteMessage(data.chatid,msg.message.message_id) 
         
        if(data.type=='inline')
            if(data.life=='change')
                this.changeMessage(data,msg.inline_message_id)
            else
                this.sendInlineData(data)
    }
    changeMessage(data,id)
    {
       // console.log('changeMessage',id,data)
        if(!data.text)
            return
        var obj={inline_message_id:id}
        obj.reply_markup={inline_keyboard:data.keys}
        this.bot.editMessageText(data.text,obj)
    }
    sendInlineData(data)
    {
        var op={}
       // return console.log(data)
        if(data.keys)
            op.inline_keyboard=data.keys
        if(data.telegramFile &&  data.fileType==teType.Photo)
        {
            
            var opobj={reply_markup:op}
            if(data.text)
                opobj.caption=data.text 
            this.bot.sendPhoto(data.chatid,data.telegramFile.telegramPath,opobj)
            return
        }
        if(data.telegramFile &&  data.fileType==teType.Video)
        {
            
            var opobj={reply_markup:op}
            if(data.text)
                opobj.caption=data.text 
            this.bot.sendVideo(data.chatid,data.telegramFile.telegramPath,opobj)
            return
        }
        if(data.telegramFile &&  data.fileType==teType.Audio)
        {
            
            var opobj={reply_markup:op}
            if(data.text)
                opobj.caption=data.text 
            this.bot.sendAudio(data.chatid,data.telegramFile.telegramPath,opobj)
            return
        }
        if(data.telegramFile &&  data.fileType==teType.Document)
        {
            
            var opobj={reply_markup:op}
            if(data.text)
                opobj.caption=data.text 
            this.bot.sendDocument(data.chatid,data.telegramFile.telegramPath,opobj)
            return
        }
        this.bot.sendMessage(data.chatid,data.text,{reply_markup:op})
    }
    getUserid(id,user,func)
    {
        if(session[id])
            return func(session[id]) 
        
        //console.log('getuserid')
        //console.log(id)
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
    async setSession(id,data)
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