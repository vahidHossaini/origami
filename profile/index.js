
module.exports = class profile
{
    constructor(config,dist)
    {
        this.context=config.context
        this.userKey=['id']
        
    }
    getProfile(msg,func,self)
    {
        var dt=msg.data
        global.db.Search(self.context,'profile',{},dt,(e,d)=>{
            return func(null,d)
        })
    }
    myProfile(msg,func,self)
    {
        var session=msg.session
        global.db.Search(self.context,'profile',{where:{id:session.userid}},{},(e,d)=>{
            if(d&& d.value.length)
            {
                return func(null,d)
            }
            func(null,{id:session.userid})
            global.db.Save(self.context,'profile',this.userKey,{id:session.userid},(e,d)=>{
                
            })
        })
        
    }
    saveProfile(msg,func,self)
    {
        var dt=msg.data
        var session=msg.session
        dt.id=session.userid
        global.db.Save(self.context,'profile',this.userKey,dt,(e,d)=>{
            return func(e,d)
        })
        
    }
}