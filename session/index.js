
class sessionManager{
    constructor(disc)
    {
        this.disc=disc 
    }
    get(context,id,func)
    {
        return this.disc.run('session','getSession',{name:context,data:{id:id}},func)
    }
    set(context,id,value,func)
    {
        //console.log('set>>>>>>',context)
        return this.disc.run('session','setSession',{name:context,data:{id:id,value:value}},func)
    }
}
module.exports = class sessionManagerService{

    constructor(config,dist)
    {
        //this.context=config.context 
        this.dist=dist 
        dist.addFunction('session','getSession',this.getSession,this)
        dist.addFunction('session','setSession',this.setSession,this)
        this.drivers={}
        for(var a of config.driver)
        {
            this.drivers[a.name]=new (require('./'+a.type+'.js'))(a,dist)
        }
        global.sm=new sessionManager(dist)
    }
    getSession(msg,func,self)
    { 
        var a =msg   
        if(!a.name || !self.drivers[a.name])
            return func({message:'driver not exist'})
        self.drivers[a.name].getSession(msg,func,self.drivers[a.name])
    }
    setSession(msg,func,self)
    {
        //console.log('setSession>>>>>>',msg)
        var a =msg   
        if(!a.name || !self.drivers[a.name])
            return func({message:'driver not exist'})
        self.drivers[a.name].setSession(msg,func,self.drivers[a.name]) 
    }
    
}