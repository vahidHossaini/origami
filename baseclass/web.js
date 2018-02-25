var Promise = require('promise');
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
        if(func)
        {
            request.post({url:url,form:data}, function (error, response, body) {
                func(error,body)
            })            
        }
        else
        {
            return new Promise(function (resolve, reject) {
                request.post({url:url,form:data}, function (error, response, body) {
                    if(error)
                        return reject(error)
                    return resolve(body)
                }) 
            })
        }        
    }
}