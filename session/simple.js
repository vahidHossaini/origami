var momentjs=require('moment')
module.exports = class sessionManagerService{

    constructor(config,dist)
    {
        this.sessions={}
        this.expire=config.expire
    }
    getSession(msg,func,self)
    { 
        var dt=msg.data
        if(!self.sessions[dt.id])
        {
            return func()
        }
        if(self.sessions[dt.id].expire && self.sessions[dt.id].expire<new Date())
        {
            delete self.sessions[dt.id]
            return func()
        }
        return func(null,self.sessions[dt.id].value)
    }
    setSession(msg,func,self)
    { 
        var dt=msg.data
        var obj={value:dt.value}
        if(self.expire)
            obj.expire= momentjs().add(self.expire,'m')
        self.sessions[dt.id]=obj
        if(self.sessions[dt.id].value==null)
            delete self.sessions[dt.id].value
        func(null,{isDone:true})
    }
    
}