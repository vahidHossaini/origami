
module.exports = class notification
{
    constructor(config,dist)
    {  
        this.config=config 
        this.context=config.context
        this.userKey=['id']
    }
    setData(msg,func,self)
    {
        var session=msg.session
        var dt=msg.data
        var id=msg.id 
        if(!id)
            return func({message:''})
        
        dt.confimed=true
        if(this.config.confirmed[id])
            dt.confimed=false
        dt.submitDate=new Date()
        if(session && session.userId)
            dt.userid=session.userId
        global.db.Save(this.context,'comment',this.userKey,dt,(ee,dd)=>{
            
        })
    }
    getData(msg,func,self)
    { 
        var dt=msg.data
        if(!id)
            return func({message:''})
        global.db.Search(this.context,'comment',{where:{$and:[{id:dt.id},{confimed:true}]}},{},(e,d)=>{
        })
        
    }
    getAdmin(msg,func,self)
    {
        var dt=msg.data
        if(!id)
            return func({message:''})
        global.db.Search(this.context,'comment',{where:{id:dt.id}},{},(e,d)=>{
        }) 
    }
}