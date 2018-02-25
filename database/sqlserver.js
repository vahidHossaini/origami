const sql = require('mssql')
var createFilter = require('odata-v4-mysql').createFilter
module.exports = class mssqlService
{
    constructor(config)
    {
        var conData={
            user: config.username,
            password: config.password,
            server: config.host, // You can use 'localhost\\instance' to connect to named instance
            database: config.database 
        }
        sql.connect(conData).then(pool => {
            this.connection=pool
        })
        
    }
  Config(structure,func)
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
      return func(null,{isDone:true})
  }
  objectToWhere(obj,param)
  {
    var str=' '
    if(obj['$and'])
    {
      for(var a of obj['$and'])
      {
        str+= '('+ this.objectToWhere(a,param) + ') and '
      }
      str=str.substr(0,str.length-4)
    }
    else if(obj['$or'])
    {
      for(var a of obj['$or'])
      {
        str+= '('+ this.objectToWhere(a,param) + ') or '
      }
      str=str.substr(0,str.length-4)
    }
    else if(obj['$like'])
    {
      str+=' like ?'
      param.push(obj['$like'])
    }
    else if(obj['$eq'])
    {
      str+=' = ?'
      param.push(obj['$eq'])
    }
    else if(obj['$ne'])
    {
      str+=' <> ?'
      param.push(obj['$ne'])
    }
    else if(obj['$lt'])
    {
      str+=' < ?'
      param.push(obj['$lt'])
    }
    else if(obj['$lte'])
    {
      str+=' <= ?'
      param.push(obj['$lte'])
    }
    else if(obj['$gt'])
    {
      str+=' > ?'
      param.push(obj['$gt'])
    }
    else if(obj['$gte'])
    {
      str+=' >= ?'
      param.push(obj['$gte'])
    }
    else {
      for(var x in obj)
      {
        if(typeof(obj[x])=='object')
        {
          str += x+' '+  this.objectToWhere(obj[x],param)
        }
        else {
          str+= x+' = ? '
          param.push(obj[x])
        }
      }
    }
    return str
  }
  CreateSyntax(name,box,odata)
  {
    var where=''
    var filter =null
    var syntax=''
    var param=[]
    var select=[]
    var order=[]
    var selectGroup=[]
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
      filter = createFilter(odata.$filter);
      for(var a=0;a<10;a++)
          filter.where=filter.where.replace('$'+a,'?')
      where+=filter.where
      param=param.concat(filter.parameters)
      
    }
    if(box.order)
    {
      order=order.concat(box.order)
    }
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
                    if(x.type=='function')
                    {
                        selectGroup.push(x)
                    }
                }
            } 
    }
    if(odata.$select)
    {
      var tsel=[]
      if(select.length)
      {
        for(var x of odata.$select)
        {
          if(select.indexOf(x)>-1)
            tsel.push(x)
        }
        select=tsel
      }
      else {
        select=odata.$select
      }
    }
    if(box.where)
    {
      var w = this.objectToWhere(box.where,param)
      console.log('MYSQL') 
      console.log(w)
      if(w)
      {
        if(where)
        {
          where+= ' and ('+ w+')'
        }
        else {
          where=w
        }
      }
    }

    var count=' select '
     syntax+='select '
    if(selectGroup.length)
    {
        for(var a of selectGroup)
            syntax+=a.name+'('+a.fild+') as ' + a.title +' ,'
         
        count +=' count( DISTINCT (' 
        for(var a of select)
            count+= a+' ,'
      count=count.substr(0,count.length-1) + '))as c'
    }
    else
    {
        count+=' count(*) as c'
    }
    if(select.length)
    {
      for(var a of select)
      {
        syntax+= a + ','
      }
    }
    else {
      syntax+=' *  '
    }
    count+=' from '+name+' '
      syntax=syntax.substr(0,syntax.length-1)
    syntax+=' from '+name+' '
    if(where)
    {
      syntax+=' where '+ where + ' '
      count+=' where '+ where + ' '
    }

    if(order.length)
        syntax+=' order by '
    for(var a of order)
    {
      syntax+= a[0]+' ,'
    }
    if(order.length)
      syntax=syntax.substr(syntax.length-1)
    
    if(selectGroup.length)
    {
        syntax+=' group by '
        for(var a of select)
            syntax+=a+' ,'
        syntax=syntax.substr(0,syntax.length-1)
    }
    if(odata.$top)
      syntax+=' LIMIT '+odata.$top
    if(odata.$skip)
      syntax+=' OFFSET '+odata.$skip
    return({syntax:syntax,count:count,param:param})
  }
  Search(name,box,odata,func)
  {
      var self=this
      var query = this.CreateSyntax(name,box,odata)
      var ms=this.struct[name] 
     self. connection.query(query.syntax,query.param, function (error, results, fields) {
         console.log('MYSQL')
         console.log(query)
       //  console.log(results)
        if(error)
            return func({message:''})
       
           for(var x of results)
           {
               for(var j in x)
               {
                   var dtx=x[j] 
                   if(Buffer.isBuffer(dtx) )
                   {
                       if(dtx.length==0)
                           x[j]=null
                       if(dtx.length==1)
                       {
                           var arr=[...dtx]
                            console.log(JSON.stringify(arr))
                           if(arr[0]==1)
                               x[j]= 1
                           else
                               x[j]=0
                       }
                               
                   }
                   
               }
           }
       if(ms && ms.js && ms.js.length)
       {
           for(var x of results)
           {
               for(var j of ms.js)
               {
                   if(x[j])
                   {
                       x[j]=JSON.parse(x[j])
                   }
               }
           }
           
       }
        if(odata.$count)
        {
         self. connection.query(query.count,query.param, function (error1, results1, fields1) {
             if(error1)
             {
                 console.log(query.count)
                 console.log(query.param)
             }
            func(null,{value:results,count:results1[0].c})
          })
        }
        else {
          func(null,{value:results})
        }
      })
  }
  Save(name,keys,data,func)
  {
      var self=this
      var s='select count(*) as c from '+name+' where '
      var ms=this.struct[name] 
      if(ms && ms.force && ms.force.length)
      {
            for(var j of ms.force)
            {
                if(!data[j.name])
                    return func({message:'app001',filed:j})
            }
      }
       if(ms && ms.js && ms.js.length)
       {
           for(var j of ms.js)
           {
               if(data[j])
               {
                   data[j]=JSON.stringify(data[j])
               }
           }
       }
      
      var param=[]
      var we=''
      for(var a of keys)
      {
        we+=' '+a+' = ?  and '
        param.push(data[a])
      }
      if(we)
          we=we.substr(0,we.length-4)
      s+=we
              console.log(s)
              console.log(param)
      self.connection.query(s,param, function (e1, r1, f1) {
          if(e1)
              console.log(e1)
        if(r1[0].c==0)
        {
          var iparam=[]
          var ins='insert into '+name+' ('
          for(var x in data)
          {
            ins+=x+' ,'
            iparam.push(data[x])
          }
          ins=ins.substr(0,ins.length-1)+')values('
          for(var x in data)
          {
            ins+='? ,'
          }
          ins=ins.substr(0,ins.length-1)+')' 
          self.connection.query(ins,iparam, function (e, r, f) {
            if(e)
              return func(e)
            return func(null,{isDone:true})
          })
        }
        else
        {
          var iparam=[]
          var ups='update '+name+' set '
          for(var x in data)
          {
            ups+= x + ' =  ? ,'
            iparam.push(data[x])
          }
          ups=ups.substr(0,ups.length-1) + ' where '
          
          
            var we=''
          for(var a of keys)
          {
            we+=' '+a+' = ? and '
            iparam.push(data[a])
          }  
          if(we)
              we=we.substr(0,we.length-4)
          ups+=we
          console.log('update')
          console.log(ups)
          console.log(iparam)
          self.connection.query(ups,iparam, function (e, r, f) {
              
          console.log(e)
          console.log(r)
            if(e)
            {
                return func(e)
            }
            return func(null,{isDone:true})
          })
        }
      }) 
  }
  Delete(name,keys,data,func)
  {
    
      var self=this
      var s='select count(*) as c from '+name+' where '
      var param=[]
      var we=''
      for(var a of keys)
      {
        we+=' '+a+' = ?  and '
        param.push(data[a])
      }
      if(we)
          we=we.substr(0,we.length-4)
      s+=we
              console.log(s)
              console.log(param)
      self.connection.query(s,param, function (e1, r1, f1) {
          if(e1)
              console.log(e1)
        if(r1[0].c==0)
        {
          return func({message:'db001'})
        }
        else
        {
          var iparam=[]
          var ups='delete from  '+name+' '  + ' where '
          
          
            var we=''
          for(var a of keys)
          {
            we+=' '+a+' = ? and '
            iparam.push(data[a])
          }  
          if(we)
              we=we.substr(0,we.length-4)
          ups+=we
          
          self.connection.query(ups,iparam, function (e, r, f) {
            if(e)
              return func(e)
            return func(null,{isDone:true})
          })
        }
      }) 
  }

}