var uuid=require('uuid')

var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");
var CryptoJS = require("crypto-js"); 
module.exports = class telegramOauth
{ 
    constructor(config,dist)
    {
        this.secret_key = SHA256( config.apiKey)
      
    }
    login(msg,func,self)
    {
          var dt=msg.data
        var str=''
        var arr=[]
        for(var a in dt)
        {
            if(a!='hash')
            {
                arr.push(a)
            }
        }
        arr.sort();
        
        for(var a of arr)
        {
            str+=a+'='+dt[a]+'\n'
        }
        str=str.substr(0,str.length-1)
        var dxt=CryptoJS.HmacSHA256(str, self.secret_key)+''
        if(dxt==dt.hash)
        {
            
            self.Search('authUser',{where:[{userid:dt.id.toString()}]},null,(e,d)=>{
                if(!d.value.length)
                {
                    self.Insert('authUser',{
                        id:uuid.v4(),
                        username:dt.username,
                        password:uuid.v4(),  
                    }
                    ,(ee,dd)=>{ 
                        }
                    )
                }
            })
            var ms=[
                    {value:dt.id.toString(),name:'userid'},
                    {value:dt.username,name:'username'},
                    {value:[],name:'roles'}
                ]
            if(dt.photo_url)
            {
                ms.push({value:dt.photo_url,name:'userImage'})
            }                
            func(null,{isDone:true,session:ms,redirect:'/'}) 
            
        }
        else
        {
            func(null,{isDone:true,redirect:'/'}) 
            
        }
    }
}