 

var createFilter = require('odata-v4-mongodb').createFilter;


module.exports = class mongodb
{
    constructor(config)
    {
      this.struct={}
        var self=this 
        self.url='mongodb://'+config.username+':'+config.password+'@'+config.host+':27017/'+config.database
        self.MongoClient= require('mongodb').MongoClient
        self.MongoClient.connect(self.url,{reconnectInterval: 10000}, function(err, client) {
            if(err)
               return console.log('Failed Connect to Mongodb')
            self.connection=client.db(config.database);
            console.log('Connect to Mongodb')
        })
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
            console.log(box.where)
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
                    grp[a.title]={ $sum: a.fild } 
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
            pxt=pxt.find(syn.where,msel)
            pxtcount=pxtcount.find(syn.where,msel)
        }
        
        if(syn.orders.length)
            pxt=pxt.sort(sort)
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
        console.log('mongodb')
        console.log(where)
        console.log(keys)
        var fsx=[]//sequelize.literal
        var sets=null
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
       if(sets)
       {
            me.connection.collection(name).updateMany(where,{$set:sets},function(err,res){ 
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
}