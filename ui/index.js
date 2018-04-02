const pug = require('pug');
var fs=require('fs')
module.exports = class uiService
{
    constructor(config,dist)
    {
        dist.addFunction('ui','load',this.load,this)
        this.path = global.path +'/'+config.path+'/'
        this.index=config.index
        if(!config.index)
            this.index='index.pug'
        global.auth['ui']={
            'load':'public',
        
        }
    }
    load(msg,func,self)
    {
        var dt = msg.data
        console.log('UI>>'+dt.name)
        var session = msg.session
        var file=self.path
        //console.log(session)
        if(dt.name && fs.existsSync(file+dt.name+'.pug'))
        {
            file+=dt.name+'.pug'
            
        }   
        else
        {
            file+=self.index
        }            
        func(null,{file:pug.renderFile(file,{data:dt,session:session})}) ;
    }
}
