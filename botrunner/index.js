var fs=require('fs')
var url = require('url');
module.exports = class butrunner
{
    constructor(config,dist)
    {
        this.config=config
        try{
            this.driver=new (require(config.driver))(config,dist) 
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
            console.log(config.domain + ' Bot configFile Error')
        }
        
        dist.addFunction(config.domain,'onMessage',this.onMessage,this)
        dist.addFunction(config.domain,'onCallback',this.onCallback,this)
        //dist.addFunction(config.domain,'onMessage',this.onMessage,this)
    }
    onCallback(msg,func,self)
    {
        var dt = msg.data 
        var session=msg.session 
        var url_parts = url.parse('z?'+dt.data, true);
        var param=url_parts.query
        console.log('--------------------')
        console.log(param)
        var st=param.b
        if(!st || !self.conf.states[st])
            return self.driver.start(dt,session,{},func)
        //console.log(self.conf)
        var des=self.conf.inputs[st][param.a]
        //console.log(des)
        if(des)
        {
            return self.driver[des](dt,session,param,(e,d)=>{
                if(d)
                    d.session=[{name:'state',value:des}]
                func(e,d)
            })
        }
    }
    onMessage(msg,func,self)
    {
        var dt = msg.data 
        var session=msg.session 
        
        for(var a of self.config.commands)
        {
            if(dt.text.indexOf(a.name)==0)
                return self.driver[a.func](dt,session,{},func)
        }
            
        if(!session || !session.state)
            return self.driver.start(dt,session,{},func)
        
    }
}