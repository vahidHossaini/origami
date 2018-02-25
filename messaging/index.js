
module.exports = class messaging
{
    constructor(config,dist)
    {
        dist.addFunction('messaging','sendMessage',this.sendMessage,this)
        dist.addFunction('messaging','getMessage',this.getMessage,this)
        this.msgKey=['_id']
        this.context=config.context
        this.isProjectable=config.isProjectable
        this.isRoleable=config.isRoleable
    }
    sendMessage(msg,func,self)
    {
        var dt = msg.data
        var session=msg.session
        var message={
            submitDate:new Date(),
            sender:session.userid,
            title:dt.title,
            desc:dt.desc,            
        }
        if(this.isProjectable && dt.projects)
            message.projects=dt.projects
        if(dt.roles)
            message.roles=dt.roles
        
        global.db.Save(this.context,'messages',this.msgKey,message,func)
        //role
        //project
        //
    }
    getMessage(msg,func,self)
    {
        var dt = msg.data
        var session=msg.session
        global.db.Search(this.context,'userMessageData',{where:{userid:session.userid}},{},(e,d)=>{
            var lastDate=new Date()
            if(d.value.length)
            {
                lastDate=d.value[0].lastView
            }
            var projs=[]
            if(this.isProjectable && session.projects && session.projects.length)
            for(var x of session.projects)
            {
                projs.push({projects.id:x.id})
            }
            global.db.Search(this.context,'messages',{where:{$and:[
                {submitDate:{$gt:lastDate}},
                {$or:[
                    {userid:{$eq:session.userid}},
                    {$and:[{userid:{$eq:null}},{roles:{$eq:null}},{projects:{$eq:null}}]},
                    {$and:[]}
                ]}
            ]}},{},(e1,d1)=>{
                
            })
            
            var condition={$and:[{$or:[]}]}
            if(lastDate)
                condition.['$and'].push({submitDate:{$gt:lastDate}})
            condition.['$and'][0]['$or'].push({$and:[{userid:{$eq:null}},{roles:{$eq:null}},{projects:{$eq:null}}]})
            if(this.isProjectable && sess.project)
            
        })
    }
}