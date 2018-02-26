# Description
This module connect to database and CRUD
supporetd database:
- mongodb
- mysql
- sqlserver (Is not currently active)


# Configuration
 
    {
        name:'database',
        connection:[
            {
                name:'default',//name of connection
                type:'mongodb',//database type: 'mongodb','mysql','sqlserver'
                host:'dbexample.com',
                username:'{username}',
                password:'{password}',
                database:'{database name}'
            }
        ]
    }
    
# How to use

### Save
if object is exist update else insert

    global.db.Save('{connectionName}','{table or collection Name}',[{key list}],object,{Function})
    
example

    global.db.Save('default','news',['title'],{title:'hi',createAt:new Date()},(error,data)=>{
        // After run Save
    })
    
### Update    

    global.db.Update('{connectionName}','{table or collection Name}',[{key list}],object,{Function})
    
example

    global.db.Update('default','news',['title'],{title:'hi',createAt:new Date()},(error,data)=>{
        // After run Update
    })
    
### Delete 

    global.db.Delete('{connectionName}','{table or collection Name}',[{key list}],object,{Function})
    
example

    global.db.Delete('default','news',['title'],{title:'hi'},(error,data)=>{
        // After run Delete
    })

### Search
        
    global.db.Search('{connectionName}','{table or collection Name}',{query},{odata},func)
    
Suppose we have an object like this

    {
        firstName:string
        lastrName:string
        age:number
        score:number
    }
    
If you want to use Odata:[Odata Doc](http://www.odata.org/documentation/)


If you want to use "query" :

- select

examples:

    select:['firstName','lastrName','age']

    select : ['age',{type:'function',name:'sum',field:'score',title:'totalScore'}]
        
- order by

example:
            
    order:[['age','ASC'],['score','DESC']]      

- where

examples:

grater than

    where:{age:{$gt:12}}    Mean age>12
    
grater or equal than

    where:{age:{$gte:12}}   Mean age>=12
    
lower than

    where:{age:{$lt:12}}    Mean age<12
    
lower or equal than

    where:{age:{$lte:12}}   Mean age<=12
    
equal than

    where:{age:{$eq:12}}   Mean age==12 
    where:{age:12}   Mean age==12 
    
not equal than

    where:{age:{$ne:12}}   Mean age<>12 | age!=12  
    
or than

    where:{$or:[{age:12},{sccore:{$gte:300}}]}   Mean (age==12 or score>=300) 
    
and than

    where:{$and:[{age:12},{sccore:{$gte:300}}]}   Mean (age==12 and score>=300) 
    
    
sample of Search    

    global.db.Search('default','UserPoint',{
                                                where:{$or:[{age:12},{sccore:{$gte:300}}]},
                                                select:['age',{type:'function',name:'sum',field:'score',title:'totalScore'}],
                                                order:[['age','ASC']]
                                           },
                                           {
                                                $top:10,
                                                $skip:12,
                                                $count:true
                                           },(error,data){
                                                //data.value is list of array
                                                var totals=data.value
                                                //if in odata count=true , return count of data without odata $top and $skip
                                                var totalCount=data.count
                                           })