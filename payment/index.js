
module.exports = class payment
{
    constructor(config,dist)
    {
        dist.addFunction('payment','getData',this.getData,this)  
        this.drivers={}
        for(var d of config.driver)
        {
            this.drivers[d.name]=new (require('./'+d.type))(d,dist)
            if(d.redirect)
                dist.addFunction('payment',d.redirect,this.drivers[d.name].purchase,this) 
        }
    }
    getData(msg,func,self)
    {
        var drname=msg.data.driverName
        if(!drname || !self.driver[drname])
            return func({message:''})
        self.driver[drname].getData(msg,func,self)
    }
    purchase(msg,func,self)
    {
        
    }
}