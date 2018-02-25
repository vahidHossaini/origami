var request = require('request');        
var baseUrl="https://mpg.ba24.ir/mpg/api/"
module.exports=class mpgService 
{
    constructor(config,dist)
    {
        this.username=config.username    
        this.password=config.password    
    }
    getData(msg,func,self)
    {
        var dt=msg.data
        var url=baseUrl+"getCardList?username=" +
                this.username + "&password=" + this.password + "&mobile=" + dt.phone
        global.web.get(url)
        .then((data)=>{
            
        })        
        .catch((err)=>{
            
        })
    }
    purchase(msg,func,self)
    {
        
    }
    
}