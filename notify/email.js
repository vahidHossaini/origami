const nodemailer = require('nodemailer');
module.exports = class emailService
{
  constructor(config)
  {
    this.context=config.context
    this.config=config 
    this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure, // true for 465, false for other ports
            auth: {
                user: config.username, // generated ethereal user
                pass: config.password  // generated ethereal password
            }
        });
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
            let mailOptions = {
                from: this.config.fromEmail, // sender address
                to: obj.to, // list of receivers
                subject: tmp.title, // Subject line
                text: tmp.text, // plain text body
                html: tmp.html // html body
            };
            this.transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    
                     console.log(error);
                     return func({message:'notSend'})
                }
                return func(null,{isDone:true})
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });
        })
    }
}