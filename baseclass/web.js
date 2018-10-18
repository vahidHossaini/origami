var request = require('request');
module.exports = class web
{
    constructor()
    { 
    }
    get(url,func)
    {
        if(func)
        {
            request(url, function (error, response, body) {
                func(error,body)
            })            
        }
        else
        {
            return new Promise(function (resolve, reject) {
                request(url, function (error, response, body) {
                    if(error)
                        return reject(error)
                    return resolve(body)
                }) 
            })
        }
    }
    post(url,data,func)    
    {
        var options = { method: 'POST',
            url: url,
            body:data,
            json: true };
            console.log(options)
        if(func)
        {
            request(options, function (error, response, body) {
                //if (error) throw new Error(error);
              
                func(error,body)
              });
                       
        }
        else
        {
            console.log(options)
            return new Promise(function (resolve, reject) {
                request(options, function (error, response, body) {
                    if (error) return reject(error);
                  
                    return resolve(body)
                  });
               
            })
        }        
    }
}