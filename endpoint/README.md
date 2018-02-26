# Description
This module takes the input information from the user and sends it to the specified service.
You can use the following:
- Express: http or https
- Socket
- Telegram

# Configuration

    {
        name:'endpoint',
        express:[{
            'public':'/public',//path of public folder
            CrossDomain:'http://localhost:4100',//If You Want Test Using Framework like Angular In Local System Without CrossDomainOrgin Error
            urlLimit:1,//url size :mb
            bodyLimit:1,//body size :mb
            http:{
                port:'8080'
            },
            https:{
                port:'8081'
            }
        }], 
        telegram:[
            {
                context:'{name of databse connection}',
                apiKey:"{API Key}",
                domain:'{telegram bot subModule domain}',
                botName:"{bot name }"
            }
        ],
        socket:[
            {
                mode:'http',//type of connection
                port:5556,
                protocol:"echo-protocol"//protocol name
            }
        ]
        
    }
    
## Express
- Get: http(s)://example.com:{port}/{domain}/{service(function)}?param1=value1&param2=value2&....
- Post:  http(s)://example.com:{port}/{domain}/{service(function)}    body:{param1:value1,param2:value2,...}  

for example:http://example.com:8080/auth/login?username=user&password=pass

## Telgram 
for more information : [Doc](https://github.com/vahidHossaini/origami/tree/master/botrunner)

## socket http(s)://example.com:{port}      data:{domain:'{domain}',service:'{service(function)}',param:{param1:value1,param2:value2,...} }
