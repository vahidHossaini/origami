
class globalNt
{
    constructor(disc)
    {
        this.disc=disc
      
    }
    Send(context,template,data,func)
    {
        if(!func)
            func=()=>{}
        this.disc.run('notify','send',{name:context,data:{obj:data,template:template}},func)
      
    }
}
module.exports = class notification
{
  constructor(config,dist)
  {
     this.drivers={} 
    for(var a of config.drivers)
    {
        this.drivers[a.name]=new (require('./'+a.type+'.js'))(a)
    } 
    dist.addFunction('notify','send',this.send,this) 
    
    global.auth['notify']={'send':'internal'} 
    global.nt=new globalNt(dist)
  }
    send(msg,func,self)
    {
        
        if(!msg.name || !self.drivers[msg.name])
            return func({message:'driver not exist'})
        self.drivers[msg.name].SendMessage(msg,func,self.drivers[msg.name])
    }
}