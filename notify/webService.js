
module.exports = class emailService
{
    constructor(config)
    {
        this.context=config.context
        this.config=config 
        this.connection={}
        if(config.protocol=='http')
        {
            connection = require('http');
            connection.post = require('http-post'); 
        }
        if(config.protocol=='https')
        {
            connection = require('https');
            connection.post = require('https-post'); 
        }
    }
    SendMessage(msg, func,self)
    {
        var data=msg.data
        
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
            option[self.config.toText]=tmp.text
            if(self.config.toTitle)
                option[self.config.toTitle]=tmp.title
            if(self.config.toHtml)
                option[self.config.html]=tmp.html
            this.connection.post(this.config.sendUrl,option, function(res){
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                     return func(null,chunk)
                     
                });
            }); 
        })
    }
}