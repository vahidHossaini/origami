var uuid=require('uuid')
module.exports = class sessionManagerService{

    constructor(config,dist)
    {
        this.config=config 
        if(config.expireTime)
        {
            this.exp=config.expireTime*60 
        }
        var op={port:config.port,ip:config.ip}
        if(config.pass)
            op.password=config.pass
        this.redis=require('redis').createClient(config.port, config.ip, {no_ready_check: true});
        
        this.redis.on('connect', function() {
            console.log('Redis client connected');
        });

        this.redis.on('error', function (err) {
            console.log('Something went wrong ' + err);
        });
       // console.log('redis',this.redis)
    }
    getSession(msg,func,self)
    { 
        var dt=msg.data
        if(!dt.id)
        {
            return func()
        }
        let key=dt.id
        self.redis.get(key,function(err, result){
            var val={}
         // console.log('getSession',err)
          //console.log('getSession',result)
            if(result)
                val=JSON.parse(result)
            func(null,{session:val})
        })
    }
    setSession(msg,func,self)
    { 
        var dt=msg.data
                    console.log('redis set>>>>>>',msg)
        if(!dt.id)
        {
            return func()
        }
        let key=dt.id
        self.redis.get(key,function(err, res1){
            var olddt={}
            if(res1)                
                var olddt=JSON.parse(res1)
            for( var i in dt.value)
            {
                let a=dt.value[i]
                if(a || a==0)
                    olddt[i]=a
                else
                    delete olddt[a.name]
            }
            //console.log('data -----------------------',msg)
          //  console.log('data -----------------------',olddt)
            self.redis.set(key,JSON.stringify(olddt),function(err, result){
                if(!self.exp)
                    self.exp = 360000000
                
                    return self.redis.expireat(key,parseInt((+new Date)/1000) + self.exp,function(err1, result1){
                    //console.log('redis set>>>>>>',err1)
                    //console.log('redis set>>>>>>',result1)
                    func(null,{isDone:true})
                    
                    })
                func(null,{isDone:true})
            })
        })
        
    }
    
}