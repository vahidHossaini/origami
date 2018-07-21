
var condition=require('./condition.js')
var mself={}
module.exports = class publication
{
    constructor(config,dist)
    {
        this.context=config.context
        this.userKey=['id']
        this.pubList={}
        //var c=new condition({$and:[{a:12},{b:11}]})
        this.replications={}
        this.userRep={}
        mself=this
        this.connection={}
        dist.addFunction('publication','connect',this.connecting,this)
        dist.addFunction('publication','createNew',this.createPublication,this)
    }
    async updateChanges(data)
    {
        console.log('updateChanges------->',data)
        var id=data.documentKey._id 
        //ns: { db: 'sht_dev', coll: 'users' }
        if(!data.ns)
            return
        var type=data.ns.coll
        if(data.operationType=='replace'){
            var newData=data.fullDocument
            for(var a in mself.userRep)
                for(var j in mself.userRep[a])
                {
                    let b=mself.userRep[a][j]
                    if(b.type==type)
                        console.log('replace-------',b.condition(newData))
                    if(b.type==type  )
                    {
                        if(b.condition(newData))
                        {
                            b.ids[id]=true
                            mself.connection[b.repId](null,{user:a,name:j,type:b.type,action:'replace',key:id,data:newData})
                            
                        }
                        else if(b.ids[id])
                        {
                            mself.connection[b.repId](null,{user:a,name:j,type:b.type,action:'delete',key:id})
                            
                        }
                    }
                }
            
        }
        if(data.operationType=='insert'){
            var newData=data.fullDocument
            for(var a in mself.userRep)
                for(var j in mself.userRep[a])
                {
                    let b=mself.userRep[a][j]
                    
                    if(b.type==type &&  b.condition(newData))
                    {
                        b.ids[id]=true
                        mself.connection[b.repId](null,{user:a,name:j,type:b.type,action:'insert',key:id,data:newData})
                    }
                }
        }
        if(data.operationType=='update'){
            var newData=data.updateDescription 
            var fulldoc=null
            var tmp=await global.db.Search(mself.context,type,{where:{_id:id}})
            if(tnp.value.length)
                fulldoc=tnp.value[0]
            else
                fulldoc={}
            for(var a in mself.userRep)
                for(var j in mself.userRep[a])
                {
                    let b=mself.userRep[a][j]
                    if(b.type==type )
                    {
                        if(b.ids[id])
                        {
                            if(b.condition(newData))
                            {
                                b.ids[id]=true
                                mself.connection[b.repId](null,{user:a,name:j,type:b.type,action:'update',key:id,data:newData}) 
                            }
                            else
                            {
                                delete b.ids[id]
                                mself.connection[b.repId](null,{user:a,name:j,type:b.type,action:'delete',key:id })
                                
                            }
                        }
                        else
                        { 
                            if(b.condition(fulldoc))
                            {
                                b.ids[id]=true
                                mself.connection[b.repId](null,{user:a,name:j,type:b.type,action:'insert',key:id ,data:fulldoc})
                                
                            }
                        }
                    }
                }
        }
        if(data.operationType=='delete'){ 
            for(var a in mself.userRep)
                for(var j in mself.userRep[a])
                {
                    let b=mself.userRep[a][j] 
                    
                    if(b.ids[id])
                    { 
                        mself.connection[b.repId](null,{
                            user:a,
                            name:j,
                            type:b.type,
                            action:'delete',key:id })
                        delete b.ids[id] 
                    }
                }
        }
    }
    async setReplication(data,userid,name,self,repId)
    {
        if(!self.replications[data.type])
        {
            self.replications[data.type]=true
            global.db.Replicate(self.context,data.type,self.updateChanges)
        }
        if(!self.userRep[userid])
            self.userRep[userid]={}
        if(!self.userRep[userid][name])
            self.userRep[userid][name]=
            {
                condition:condition.createCondition(data.condition) ,
                conditionUpdate:condition.createConditionCheck(data.condition) ,
                type:data.type,
                ids:{},
                repId:repId,
                data:[]
            }
        var q={}
        if(data.condition)
            q.where=data.condition
        var dt = await global.db.Search(self.context,data.type,q,{}) 
        //console.log('>>>',dt)
        for(var a of dt.value)
        {

        mself.connection[repId](null,{
            user:userid,
            name:name,
            type:data.type,
            action:'insert',key:a._id,data:a })
            //this.userRep[userid][name].data.push({status:'insert'})
            self.userRep[userid][name].ids[a._id]=true
        }
    }
    async createPublication(msg,func,self)
    {
        let dt=msg.data
        let userid=dt.userid
        let subsName=dt.name
        //let data =dt.data
        //data:{type,condition}
        self.setReplication(dt,userid,subsName,self,dt.id)
    }
    async connecting(msg,func,self)
    {
        let dt=msg.data 
        self.connection[msg.id]=func
    }
    
    
    publicationData(msg,func,self)
    {
        let dt=msg.data
        let nobj=dt.obj 
        let opr=dt.opr
        let key=dt.key
        if(!key)
            key='_id'
        for(let x in self.pubList)
        {
            var a=self.pubList[x]
            if(opr=='d')
            {
                if(x.data[dt.obj[key]])
                {
                    delete x.data[dt.obj[key]]
                    
                }
            }
        }
    }
    addPublication(msg,func,self)
    {
        var dt=msg.data
        var session=dt.session
        self.pubList[session.userid]={func:func,cond:new condition(dt.codition),data:{}}
    }
    removePublication(msg,func,self)
    {
        
    }
    
  
}