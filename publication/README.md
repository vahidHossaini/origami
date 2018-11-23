

    async test(msg,func,self)
    {
        var dt=msg.data.vehicle
        var session=msg.session
        var user=await self.getUser(session) 
        console.log('createPublication',msg.data)
        if(!user)
        {
            return func({m:errs.wrongData})
        } 
        try{
            self.dist.run('publication','createNew',{data:{id:msg.data.pubid.id,userid:user.id,name:'test',type:'vehicles',condition:{name:'vahid'}}})
            
        }catch(exp){
            console.log('err : ',exp)
        }
    }