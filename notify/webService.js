
module.exports = class nofifyWebService
{
    constructor(config)
    {
        this.context=config.context
        this.config=config 
        this.connection={}
        if(config.protocol=='http')
        {
            this.connection = require('http');
            this.connection.post = require('http-post'); 
        }
        if(config.protocol=='https')
        {
            this.connection = require('https');
            this.connection.post = require('https-post'); 
        }
    }
    SendMessage(msg, func,self)
    {
        var data=msg.data
        console.log('send message',msg)
        global.db.Search(this.context,'template',{where:{name:data.template}},{},(e,d)=>{
            if(!d || !d.value.length)
                return func({message:'TemplateNotFound'})
            var tmp=d.value[0]
            var obj=data.obj
            for(var x in obj)
            {
                tmp.title= tmp.title.replaceAll('{{'+x+'}}',obj[x])
                tmp.text= tmp.text.replaceAll('{{'+x+'}}',obj[x])
                tmp.html= tmp.html.replaceAll('{{'+x+'}}',obj[x])
            }
            var option=JSON.parse(JSON.stringify(self.config.option))
            option[self.config.toField]=obj.to
            option[self.config.textField]=tmp.text
            if(self.config.titleField)
                option[self.config.titleField]=tmp.title
            if(self.config.htmlField)
                option[self.config.htmlField]=tmp.html
                
            
        console.log('send message',option)
            this.connection.post(this.config.sendUrl,option, function(res){
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
        console.log('send message recive',chunk)
                     return func(null,chunk)
                     
                });
            }); 
        })
    }
}