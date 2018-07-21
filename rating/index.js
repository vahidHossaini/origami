class globalRate
{
    constructor(disc)
    {
        this.disc=disc
    }
    
}
module.exports = class rating
{
    constructor(config,dist)
    {
        this.config=config
        this.context=config.context
    }
    async getRating(msg,func,self)
    {
        let dt =msg.data
        var rate = await global.db.SearchOne(this.context,'rating',{where:{id:dt.id}},{})
        if(!rate)
            return func({m:'not exist'})
        return func(null,rate)
    }
    async getUserRating(msg,func,self)
    {
        let session=msg.session
        var rate = await global.db.SearchOne(this.context,'rating',{where:{id:session.userid}},{})
        if(!rate)
            return func({m:'not exist'})
        return func(null,rate) 
    }
    async setRating(msg,func,self)
    {
        let dt =msg.data
        if(!dt.userid ||!dt.id)
            return func({m:'not exist'})
        var key=dt.userid
        if(dt.tag)
        {
            key+='_'+dt.tag
        }
        var rate = await global.db.Save(this.context,'rating',['id'],{id:dt.id,$array:{func:'add',unique:true,value:key}})
        console.log(rate)
        return func(null,{})
    }
    deleteRating(msg,func,self)
    {
        
    }
}