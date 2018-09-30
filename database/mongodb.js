 
//var createFilter = require('odata-v4-mongodb').createFilter;
var parser = require('odata-v4-parser');
var methods=function(token)
{
    if(token.method=="startswith")
    {
        var p=token.parameters
        var obj={}
        obj[convert(p[0])]={'$regex':"\^"+convert(p[1])+""}
        console.log(obj)
        //obj[convert(p[1])]={'$regex':\^convert(p[0])\}
        return obj
    }
    if(token.method=="endswith")
    {
        var p=token.parameters
        var obj={}
        obj[convert(p[0])]={'$regex':""+convert(p[1])+"\^"}
        console.log(obj)
        //obj[convert(p[1])]={'$regex':\^convert(p[0])\}
        return obj
    }
    if(token.method=="substringof")
    {//regex
        var p=token.parameters
        var obj={}
        obj[convert(p[1])]={'$regex':convert(p[0])}
        return obj
    }
}  
var convert = function(token)
{
    var obj={} 
    if(token.value)
    {
        if(token.type=="Literal")
        {
             if(token.value=="Edm.Boolean")
             {
                 return !!(token.raw)
             }
             if(token.value=="null")
             {
                 return null
             }
             if(token.value=="Edm.SByte")
             {
                 return parseInt(token.raw)
             }
             if(token.value=="Edm.Int16")
             {
                 return parseInt(token.raw)
             }
             if(token.value=="Edm.Int32")
             {
                 return parseInt(token.raw)
             }
             if(token.value=="Edm.String")
             {
                 return token.raw.substr(1,token.raw.length-2)
             }
        }
        if(token.type=="MethodCallExpression")
        {
            return methods(token.value)
        }
        if(token.type=="ODataIdentifier")
        {
            console.log('XXX->',token.value)
            return token.value.name
        }
        if(token.type=="AndExpression")
        {
            var cv=convert(token.value.right)
            var lf=convert(token.value.left) 
            console.log('VVVVV ',lf)
            return {"$and":[lf,cv]}
        }
        if(token.type=="EqualsExpression")
        {
            var s={}
            var cv=convert(token.value.right)
            var lf=convert(token.value.left) 
                s['$eq']=cv
                obj[lf] =s
            
        }
        if(token.type=="GreaterThanExpression")
        {
            var s={}
            var cv=convert(token.value.right)
            var lf=convert(token.value.left) 
                s['$gt']=cv
                obj[lf] =s
            
        }
        if(token.type=="GreaterOrEqualsExpression")
        {
            var s={}
            var cv=convert(token.value.right)
            var lf=convert(token.value.left) 
                s['$gte']=cv
                obj[lf] =s
            
        }
        if(token.type=="LesserThanExpression")
        {
            var s={}
            var cv=convert(token.value.right)
            var lf=convert(token.value.left) 
                s['$lt']=cv
                obj[lf] =s
            
        }
        if(token.type=="LesserOrEqualsExpression")
        {
            var s={}
            var cv=convert(token.value.right)
            var lf=convert(token.value.left) 
                s['$lte']=cv
                obj[lf] =s
            
        }
        if(token.type=="NotEqualsExpression")
        {
            var s={}
            var cv=convert(token.value.right)
            var lf=convert(token.value.left) 
                s['$ne']=cv
                obj[lf] =s
            
        }
         
        if(token.value.current)
        {
            var cv=convert(token.value.current)+'.'+convert(token.value.next)
            console.log('CCC->',cv)
           return   cv
        }
        if(token.type=="PropertyPathExpression"||
        token.type=="CommonExpression"||
        token.type=="MemberExpression"||
        token.type=="SingleNavigationExpression"||
        token.type=="FirstMemberExpression")
            return convert(token.value)
    }
    return obj
}


var createFilter =function(data)
{
    return convert(parser.filter(data))
}
const assert = require("assert");

module.exports = class mongodb
{
    constructor(config)
    {
      this.struct={}
        var self=this 
        var port= '27017'
        if(config.port)
            port=config.port
        
        self.url='mongodb://'+config.host+':'+port+'/'+config.database
        if(config.username)
        {
        self.url='mongodb://'+config.username+':'+config.password+'@'+config.host+':'+port+'/'+config.database
            
        }
        self.MongoClient= require('mongodb').MongoClient
        self.MongoClient.connect(self.url,{reconnectInterval: 10000,useNewUrlParser: true}, function(err, client) {
            if(err)
               return console.log('Failed Connect to Mongodb')
            self.connection=client.db(config.database);
            console.log('Connect to Mongodb')
        })
        if(config.replicate)
        {
            var r=config.replicate
            if(r.port)
                port=r.port;
                console.log('connecting to MongoClient Replication  ===> '+r.host+':'+port)
                
            var repurl='mongodb://'+r.host+':'+port+'/'+r.database+'?replicaSet='+r.name
            if(r.username)
            {
                repurl='mongodb://'+r.username+':'+r.password+'@'+r.host+':'+port+'/'+r.database+'?replicaSet='+r.name
            }
            //console.log('////',repurl)
            self.MongoClient.connect(repurl,{reconnectInterval: 10000,useNewUrlParser: true}).then(client => {
            //console.log('////',client)
                self.dbReplication = client.db(r.database);
                self.replicaColl={}
                self.replicaReq={}
                //console.log('connect to MongoClient Replication',self.dbReplication.collection('users').watch)
            }).catch((exp)=>{
                console.log('Replication Error : ',e.message)
                //console.log('e : ',exp)
            })
        }
    }
    Config(structure)
    {
      this.struct={}
      for(var a of structure)
      {
          var obj={
              tableName:a.tableName,
              cols:a.cols,
              js:[],
              force:[]
          }
          
          for(var x in a.cols)
          {
              if(a.cols[x].type=='Json')
              {
                  obj.js.push(x)
              }
              if(a.cols[x].isForce)
              {
                  obj.force.push({name:x,title:a.cols[x].title})
              }
          }
          
          this.struct[a.name]=obj
      }
    }
    objectToWhere(obj)
    {
        for(var a in obj)
        {
            if(obj[a] && obj[a].$like)
            {
                var stval= new RegExp(context.literal, "gi")            
                if(obj[a].$like[0]=='%' && obj[a].$like[obj[a].$like.length]=='%')
                    stval = new RegExp("^" + obj[a].$like + "$", "gi");
                if(  obj[a].$like[obj[a].$like.length]=='%')
                    stval = new RegExp(  obj[a].$like + "$", "gi");
                if(obj[a].$like[0]=='%'  )
                    stval = new RegExp("^" + obj[a].$like  , "gi");
                obj[a]=stval
                
            }
        } 
        if(obj.$and)
        {
            for(var x of obj.$and)
            {
                this.objectToWhere(x)
            }
        }
        if(obj.$or)
        {
            for(var x of obj.$or)
            {
                this.objectToWhere(x)
            }
        }
    }
    CreateSyntax(name,box,odata)
    {
        var filter = null;
        var where=''
        var filter =null
        var syntax=''
        var param=[]
        var select=[]
        var selectGroup=[]
        var order=[]
        
        if(box.select)
        {
            for(var x of box.select)
            {
                if(typeof(x)=='string')
                {
                    select.push(x)
                }
                else
                {
                    if(a.type=='function')
                    {
                        selectGroup.push(a)
                    }
                }
            } 
        } 
        if(box.where)
        { 
            this.objectToWhere(box.where) 
            //console.log(box.where)
        }
        
        
        if(odata.$select)
        {
            var tempssl=[]
            var sles=odata.$select.split(',')
            if(sles.length>0)
            {
                if(select.length)
                    for(var x of sles)
                    {
                        if(select.indexOf(x)>-1)
                            tempssl.push(x)
                    }
                else
                    tempssl=sles
                select=tempssl
            }
        }
        if(odata.$orderby)
        {
          var ors=odata.$orderby.split(',')
          for(var a of ors)
          {
            var ord=a.split(' ')
            if(ord.length>1)
            {
              order.push([ord[0],ord[1]])
            }
            else {
              order.push([a,'asc'])
            }

          }
        }
        if(odata.$filter)
        {
            filter=createFilter(odata.$filter)
        }
        var objorder={}
        var objwhere=null
        var objselect=null
        if(box.where || filter)
        {
            if(box.where && filter)
            {
                objwhere={$and:[box.where,filter]}
            }
            else if(box.where)
            {
                objwhere=box.where
            }
            else
            {
                objwhere=filter
            }
        }
        if(box.order)
        {
            //console.log('Getting order ----------------',box.order)
            for(var a of box.order)
              order.push(a)
            //console.log('Getting order ----------------',order)
        }
        if(order.length)
        {
            for(var a of order)
            {
                objorder[a[0]]=1
                if(a[1].toLowerCase() =='desc')
                {
                    objorder[a[0]]=-1
                }
            }
            //console.log('Getting order ----------------',objorder)
            //console.log('Getting order ----------------',order)
        }
        if(select.length)
            objselect={}
        for(var a of select)
        {
            objselect[a]=1
        }
        var retobj={orders:objorder,where:objwhere,select:select,selectGroup:selectGroup}
        if(odata.$top)
            retobj.top=odata.$top
        if(odata.$skip)
            retobj.skip=odata.$skip
        return(retobj)
    }
    Search(name,box,odata,func)
    {
        var me=this
        var syn=this.CreateSyntax(name,box,odata)
        var ms=this.struct[name] 
        var selectGroup=syn.selectGroup
        var pxt=me.connection.collection(name)
        var pxtcount=me.connection.collection(name)
        if(selectGroup.length)
        {
            var marr=[]
            marr.push({$match:syn.where})
            var msel={}
            for(var a of syn.select)
            {
                msel[a]='$'+ a
            }
            var grp={_id:msel}
            for(var a of selectGroup)
            {
                if(a.name=='count')
                    grp[a.title]={ $sum: 1 } 
                if(a.name=='sum')
                    grp[a.title]={ $sum: a.field } 
            }
            marr.push({$group:grp})
            pxt=pxt.aggregate(marr)
            pxtcount=pxtcount.aggregate(marr)
        }
        else
        {
            var msel={}
            for(var a of syn.select)
            {
                msel[a]=1
            }
            msel={fields:msel} 
            pxt=pxt.find(syn.where,msel)
            pxtcount=pxtcount.find(syn.where,msel)
        }
        
        if(syn.orders)
            pxt=pxt.sort(syn.orders)
        //if(syn.orders)
        //    console.log('sort---------------',syn.orders)
        if(syn.skip)
        {
            pxt=pxt.skip(parseInt(syn.skip))            
        }
        if(syn.top)
        { 
            pxt=pxt.limit(parseInt(syn.top) )
        }
        var count=null
        if(odata['$count'])
        {
            pxtcount.count((ecount,dcount)=>{
                count=dcount
                pxt.toArray(function(err, result) {
                    //console.log(err);

                    if(err)
                    {
                        return func({err:err})
                    }
                    if(selectGroup.length)
                    {
                        var lv=[]
                        for(var b of result)
                        {
                            var ob1=b._id
                            for(var a of selectGroup)
                            {
                                ob1[a.title]=b[a.title]
                            }
                            lv.push(ob1)
                        }
                        return func(null,{value:lv,count:count})
                    }
                    //console.log(result);
                    func(null,{value:result,count:count})

                });
            })
            return
        }
        pxt.toArray(function(err, result) { 
            //console.log(err);

            if(err)
            {
                return func({err:err})
            }
            if(selectGroup.length)
            {
                var lv=[]
                for(var b of result)
                {
                    var ob1=b._id
                    for(var a of selectGroup)
                    {
                        ob1[a.title]=b[a.title]
                    }
                    lv.push(ob1)
                }
               return func(null,{value:lv})
            } 
            
            func(null,{value:result})
            
          });
    }
    Update(name,keys,data,func)
    {
        var me=this
        var where={}
        for(var a of keys)
        { 
            where[a]={$eq:data[a]}
        }
        //console.log('mongodb')
        //console.log(where)
        //console.log(keys)
        var fsx=[]//sequelize.literal
        var sets=null
        var arr=null
        var key = Object.keys(data)
        for(var a of key)
        {
            if(data[a] &&  data[a]['$function'])
            {
                var fd=data[a]['$function']
                for(var b=0;b<100;b++)
                {
                    fd=fd.replace('$','doc.')
                }
                
                fsx.push('doc.'+a+'='+fd)
            }
            if(data[a] &&  data[a]['$array'])
            {
                var array=data[a]['$array']
                if(!array)
                {
                    var field =array.field 
                    var subfield =array.subfield
                    var func='$push'
                    var val =array.value
                    if(array.unique)
                        func='$addToSet'
                    
                    if(array.func=='add')
                    {
                        func='$push'
                        if(Array.isArray(val))
                        {
                            val={$each:val}
                        }
                    }   
                    
                    if(array.func=='delete')
                    {
                        if(array.where)
                        {
                            if(array.where=='first')
                            {
                                func='$pop'
                                val=-1
                            }
                            else if(array.where=='last')
                            {
                                func='$pop'
                                val=1
                            }
                            else
                            {
                                func='$pull'
                                val=array.where
                            }                            
                        }
                        else
                        {
                            func='$pullAll'  
                        }
                    }
                    if(array.func=='update')
                    {
                        if(array.where)
                        {
                            if(array.where=='first')
                            {
                                if(!sets)sets={}
                                var f=field+'.$'
                                if(subfield)
                                    f+='.'+subfield
                                sets[subfield]=val
                                func=null
                            }
                            if(array.where=='all')
                            {
                                if(!sets)sets={}
                                var f=field+'.$[]'
                                if(subfield)
                                    f+='.'+subfield
                                sets[subfield]=val
                                func=null
                            }
                            
                        }
                        
                    }
                    if(func)
                    {
                        arr={}
                        arr[func]=val
                    }
                }
            }
            else
            {
                if(!sets)sets={}
                sets[a]=data[a]
            }
        }
        var fstr='module.exports = function(doc){'
        for(var x of fsx)
            fstr+=x+'\r\n'
        fstr+='\r\n me.connection.collection(\''+name+'\').save(doc);}'
      // console.log(fstr)
       
        var myfunct=eval(fstr)
        if(sets || arr)
        {
            var obj={}
            if(sets)
            {
                obj.$set=sets
            }
            if(arr)
            {
                for(var x in arr)
                {
                    obj[x]=arr[x]
                }
            }
            me.connection.collection(name).updateMany(where,obj,function(err,res){ 
                if(fsx.length)
                {
                    me.connection.collection(name).find(where).forEach(myfunct,function(){func(err,res)});
                }
                else
                {
                    func(err,res)
                }
                          
            })
           
        }
        else
        {
            global.Log(fstr,where)
            me.connection.collection(name).find(where).forEach(myfunct,function(){func(null, {})});           
        }
    }
    Insert(name,keys,data,func)
    {
        var self=this 
        self.connection.collection(name).insertOne(data, function(err, res) { 
            var obj={}
            if(!err)
                obj.isDone=true
            obj.insertedCount=res.result.n
            //console.log(obj)
            //console.log(res)
            func(err, obj)
          });
    }
    Save(name,keys,data,func)
    {
        var self=this
        var where={}
        for(var a of keys)
        { 
            where[a]={$eq:data[a]}
        }
        var pxt=self.connection.collection(name).findOne(where,(err,dt)=>{
            if(!dt)
            {
                self.Insert(name,keys,data,func)
            }
            else
            { 
                self.Update(name,keys,data,func)
            }
        })
        
    }
    Delete(name,keys,data,func)
    {
        var self=this
        var where={}
        for(var a of keys)
        { 
            where[a]={$eq:data[a]}
        }
        var pxt=self.connection.collection(name).deleteMany(where,(err,dt)=>{
            func(err,dt)
        })
    }
    Replicate(table,func)
    {
        var self=this
        if(self.replicaColl[table])
        {
            self.replicaReq[table].push(func)
            return
        }
        let pipeline = [
          {
            $project: { 
              //  documentKey: true ,
                fullDocument:true,
                ns:true,
                updateDescription:true,
                documentKey: true ,
                operationType:true
            }
          }
        ]
        
        self.replicaColl[table]=self.dbReplication.collection(table).watch(pipeline)
        self.replicaReq[table]=[func]
        self.replicaColl[table].on("change", (change)=> {
         // console.log('======change',change);
            for(var a of self.replicaReq[table])
                a(change)
        });
    }
}