# Description
This module send notification 
supporetd :
- email
- webService (like sms service)

# Configuration

    {
        drivers:[
            {
                name:'{name of notification}',
                type:'{type}',//type of service 'email' ,'webService'
                
                //if email
                host:'{host ex:}',
                port:{port default is 465},
                secure:{boolean},
                username:'{username}',
                password:'{password}',
                fromEmail:'{email Address}',
                
                //WebService
                protocol:'{http or https}',
                sendUrl:'{url}'
                toField:'{The name of the field that specifies the destination of the message}',
                textField:'{The name of the field that specifies the text of the message}',
                titleField:'{The name of the field that specifies the title of the message}',//there is no force
                htmlField:'{The name of the field that specifies the html of the message}',//there is no force
            }
        ]
    }
# How to use

    global.nt.Send('{name of notification}','{template}',{data},function)
    
example

    global.nt.Send('googleMail','resetPassword',{username:'vahid',code:'34986',to:'vahid.hossaini@gmail.com'},
        (error,data)={
            //after send message
        })
    