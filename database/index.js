var dbs={}

global.tdb=class transactionDb
{
    constructor(context)
    {
    //global.dist
        this.context=context
        this.data=[]
    }
    Insert(table,data)
    {
        this.data.push({
            name:table, 
            data:data,
            type:'insert'
        })
        return this
    }
    Update(table,key,data)
    {
        this.data.push({
            name:table,
            keys:key,
            data:data,
            type:'update'
        })
        return this
    }
    Delete(table,key,data)
    {
        this.data.push({
            name:table,
            keys:key,
            data:data,
            type:'delete'
        })
        return this
    }
    Transact(func)
    {
        global.dist.run('database','transaction',{name:this.context,tdata:this.data},func)
    }
}

class globalDb
{
    constructor(disc)
    {
        this.disc=disc
        this.type={
            string:{
                mysql:'nvarchar',
                mssql:'nvarchar'
            },
            bool:{
                mysql:'bit',
                mssql:'bit'
            },
            small:{
                mysql:'int',
                mssql:'int'
            },
            number:{
                mysql:'bigint',
                mssql:'bigint'
            },
            Json:{
                mysql:'bigint',
                mssql:'bigint'
            },
            object:{
                complex:true,

            },
            array:{
                complex:true
            }
        }
        
    }
    Config(context,structure,func)
    {
        return this.disc.run('database','config',{name:context,structure:structure},func)
    }
    Search(context,table,query,odata,func)
    {
        if(!odata)
            odata={}
        return this.disc.run('database','search',{name:context,table:table,query:query,odata:odata},func)
    }
    SearchOne(context,table,query,odata,func)
    {
        if(!odata)
            odata={}
        return this.disc.run('database','searchOne',{name:context,table:table,query:query,odata:odata},func)
    }
    Save(context,table,key,data,func)
    {
        return this.disc.run('database','save',{name:context,table:table,key:key,data:data},func)
    }
    Delete(context,table,key,data,func)
    {
        return this.disc.run('database','delete',{name:context,table:table,key:key,data:data},func)
    }
    Update(context,table,key,data,func)
    {
        return this.disc.run('database','update',{name:context,table:table,key:key,data:data},func)
    } 
    Replicate(context,table,func)
    {
        return this.disc.run('database','replicate',{name:context,table:table},func)
        
    }
}
module.exports = class database
{
    constructor(config,dist)
    {
        global.db=new globalDb(dist)
        global.dist=dist
        
        if(config.servers)
            return
        for(var a of config.connection)
        {
            dbs[a.name]=new (require('./'+a.type))(a,dist)
        }
        var self=this
        dist.addFunction('database','search',this.Search,self)
        dist.addFunction('database','searchOne',this.searchOne,self)
        dist.addFunction('database','save',this.Save,self)
        dist.addFunction('database','delete',this.Delete,self)
        dist.addFunction('database','config',this.Config,self)
        dist.addFunction('database','update',this.Update,self)
        dist.addFunction('database','transaction',this.Transaction,self)
        dist.addFunction('database','replicate',this.Replicate,self)
    }
    getPackages(config)
    {
        var p=[]
        for(var a of config.connection)
        {
            if(a.type=='mongodb')
            {
                p.push('odata-v4-mongodb')
                p.push('assert')
                p.push('mongodb')
            }
            if(a.type=='mysql')
            {
                p.push('odata-v4-mysql')
                p.push('mysql') 
            }
        }
        return p
    }
    Search(msg,func,self)
    {
        var a =msg   
        if(!a.name || !dbs[a.name])
            return func({message:'connection not exist'})
        dbs[a.name].Search(a.table,a.query,a.odata,func)
    }
    searchOne(msg,func,self)
    {
        var a =msg   
        if(!a.name || !dbs[a.name])
            return func({message:'connection not exist'})
        dbs[a.name].Search(a.table,a.query,a.odata,(ee,dd)=>{
            if(dd.value.length)
            {
                return func(null,dd.value[0])
            }
            else{ 
                return func(null,null)
            }
        })
    }
    Save(msg,func,self)
    {
        var a =msg   
        if(!a.name || !dbs[a.name])
            return func({message:'connection not exist'})
        dbs[a.name].Save(a.table,a.key,a.data,func)
    }
    Update(msg,func,self)
    {
        var a =msg   
        if(!a.name || !dbs[a.name])
            return func({message:'connection not exist'})
        dbs[a.name].Update(a.table,a.key,a.data,func)
    }
    Delete(msg,func,self)
    {
        var a =msg   
        if(!a.name || !dbs[a.name])
            return func({message:'connection not exist'})
        dbs[a.name].Delete(a.table,a.key,a.data,func)
    }
    Replicate(msg,func,self)
    {
        var a =msg   
        if(!a.name || !dbs[a.name])
            return func({message:'connection not exist'})
        dbs[a.name].Replicate(a.table,func)
    }
    Transaction(msg,func,self)
    {
        var a =msg    
        if(!a.name || !dbs[a.name])
            return func({message:'connection not exist'})
        dbs[a.name].Transaction(a.tdata,func)
    }
    Config(msg,func,self)
    {
        var a =msg   
        if(!a.name || !dbs[a.name])
            return func({message:'connection not exist'})
        dbs[a.name].Config(a.structure,func)

    }
}
