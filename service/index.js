
module.exports = class services
{
  constructor(config,dist)
  {
    this.queueDomain={}   
    this.context=config.context
    this.driver=new (require(config.driver))(config,dist)
    if(config.structure)
        this.enums=require(config.structure)
    //console.log('enums--->',this.enums)
    this.queue=new (require('./simpleQueue.js'))()
    var isQ=false
    var queueNames={}
    for(var a of config.funcs)
    {
        if(a.queue)
        {
            isQ=true
            queueNames[a.queue]=0
            this.queue.addQueue(a.queue)
            this.queueDomain[config.domain+'_'+a.name]=a.queue
            console.log('Quee',config.domain,a.name)
            dist.addFunction(config.domain,a.name, this.SetQueue,this,a.inputs)
        }
        else
            dist.addFunction(config.domain,a.name, this.driver[a.name],this.driver,a.inputs)
    }
    for(var a in queueNames)
    {
        this.RunQueueReader(a)
    } 
    global.authz[config.domain]=config.funcs
    global.auth[config.domain]={}
    for(var x of config.auth)
    {
        if(typeof(x)=='string')
            global.auth[config.domain][x]='public'
        else
            global.auth[config.domain][x.name]=x.role
    }
    
    var structure=require(config.structure) 
    dist.setClass(config.domain,structure)
  }
  
    SetQueue(msg,func,self,domain)
    {
        var q = self.queueDomain[domain.domain+'_'+domain.subDomain]
        self.queue.add(q,domain,msg,func)
        //console.log('SetQueue',msg,domain)
    }
    RunQueueReader(name)
    {
        var work=false
        setInterval(async ()=>{
            if(work)
                return
            work=true
            var data=this.queue.pop(name)
            while(data)
            {
                 await this.GetPromise(this,data) //this.driver[data.domain.subDomain](data.message,data.func,this.driver)
                data=this.queue.pop(name)
            }
            work=false
        },
        100)
    }
    GetPromise(self,data)
    {
        //console.log('DATA',data)
        return new Promise(function (resolve, reject) {
            self.driver[data.domain.subDomain](data.message,(e,d)=>{
                resolve()
                data.func(e,d)
            },self.driver)
        })
    }
}
