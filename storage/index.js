var memory= require("C:\\project\\OrigamiCore\\shareMemory\\index.js").Client
//var memory= require("sharememory").Client
const BinaryFile = require('binary-file');
var fs=require('fs')
const fsPromises = require('fs').promises;
class FileWrite
{
    constructor()
    {
    }
    async create(srtg,path,mainPath)
    {
        //console.log('>>>',mainPath)
        //console.log('>>>',path)
        this.fullPath=mainPath+path
        this.srtg=srtg
        this.expTime=global.addMin(new Date(),5)
        this.myBinaryFile = new BinaryFile(mainPath+path, 'w');
        await this.myBinaryFile.open()   
    }
    async write(array,position)
    {
        if(array.length+position>this.srtg.size)
            return false
        //console.log('---buffer',array)
        var buf = Buffer.from(array);
        try
        {
            await this.myBinaryFile.write(buf,position)            
        }
        catch(exp){
            return false
        }
        return true
    } 
    async close()
    {
        this.size=await  this.myBinaryFile.size()
        console.log('=============',this.size)
         await this.myBinaryFile.close()
         return 
    }
    
}
module.exports = class storage
{
    constructor(config,dist)
    {
        this.downloader={}
        this.pointers={}
        this.context=config.context
        this.fileContex=config.fileContex
        this.config=config 
        if(config.memory)
        {
            this.memory=new memory(config.memory.address,config.memory.port)
        }
        this.db=config.db
        var self=this
        this.lastPath=''
        this.lastcount=0
        this.maxFile=config.maxFile|1000
        dist.addFunction('fs','create',this.create,self)
        dist.addFunction('fs','upload',this.upload,self)
        dist.addFunction('fs','completed',this.close,self)
        dist.addFunction('fs','download',this.download,self)
        dist.addFunction('fs','downloadData',this.downloadData,self)
         global.auth['fs']={ 
            'create':'login', 
            'upload':'login', 
            'completed':'login', 
            'download':'login', 
            'downloadData':'login', 
            
            }
        this.downloads={}    
    } 
    createDir(path)
    {
        if(!fs.existsSync(path))
            fs.mkdirSync(path)
    }
    async getpath(px)
    {
        var dt = new Date()
        var day=dt.getDate()
        var mon=dt.getMonth()+1
        var year=dt.getFullYear()
        var name
        var p = year+'\\';
        this.createDir(px+p)
        if(mon<10)
            p+='0'
        p+=mon+'\\'
        this.createDir(px+p)
        
        if(day<10)
            p+='0'
        p+=day
        this.createDir(px+p)
        
        if(p!=this.lastPath)
        {
           // console.log('-------------1',fsPromises)
            this.lastPath=p
             
            this.createDir(px+this.lastPath)
            var flen = fs.readdirSync(px+this.lastPath).length
            
            console.log('-------------2',flen)
            if(flen>0)
            {
                this.filecount=(flen-1)*this.maxFile
                
            console.log('-------------2', fs.readdirSync(px+p+'\\'+(flen-1)+'\\'))
                this.filecount += fs.readdirSync(px+p+'\\'+(flen-1)+'\\').length
            console.log('-------------2',this.filecount)
            }
            else
            {
                this.filecount=0
                this.filecount=0
                fs.mkdirSync(this.config.path+p+'\\0')
            }
            console.log('-------------3_1')
            await this.memory.setData(this.fileContex,'filecount',this.filecount)
            console.log('-------------3')
        }
        var nextcount= await this.memory.incData(this.fileContex,'filecount')
        
            console.log('-------------4',nextcount)
        var fol=Math.floor(nextcount/this.maxFile)
        var fil=nextcount%this.maxFile
        if(this.lastcount!=fol)
        {
            this.lastcount=fol
            fs.mkdirSync(this.config.path+p+'\\'+this.lastcount)
        }
        return p+'\\'+fol+'\\'+fil
    }
    getContinue(msg,func,self)
    {
        var s=msg.session
        var dt=msg.data
        if(!self.pointers[s.stg.id])
            return func({m:'not exist'})
        if(s.stg.id!=dt.id)
            return func({m:'not exist'})
            
    }
    async downloadData(msg,func,self)
    {
        var dt=msg.data 
        if(!dt.id)
        {
                return func({m:'not exist'})            
        }
        var f=self.downloads[dt.id]
        if(!f)
        {
            var file = await global.db.SearchOne(self.db.dbcontext,self.db.table,{where:{id:dt.id}},{})
            if(!file)
                return func({m:'not exist'})
            f=file
        }
        return func(null,{size:f.size,ext:f.ext})
    }
    async download(msg,func,self)
    {
        //var s=msg.session
        var dt=msg.data
       // console.log(typeof(dt.pos))
        if((!dt.pos && dt.pos!=0)  || !dt.id || !dt.len)
            return func({m:'not exist'})
        var f=self.downloads[dt.id]
        if(!f)
        {
            var file = await global.db.SearchOne(self.db.dbcontext,self.db.table,{where:{id:dt.id}},{})
            if(!file)
                return func({m:'not exist'})
            f=file
        }
       // console.log('download',b)
            var b = new BinaryFile(f.path, 'r');
            
        await b.open()   
        var size= await b.size() 
        //console.log(size)
        //console.log(dt.pos)
            if(size<=dt.pos)
                var c={data:[]}
            else
            {
                if(dt.len+dt.pos>size)
                {
                    var c= await b.read( size-dt.pos,dt.pos)
                }
                else
                    var c= await b.read( dt.len,dt.pos)
                    
            }
        await b.close()   
         
        return func(null,{i:true,data:c})
    }
    async create(msg,func,self)
    { 
        var s=msg.session
        var dt=msg.data
        if(!s.stg)
            return func({m:'access'})
        if(self.pointers[s.stg.id])
            return func({m:'exist'})
        if(!dt.ext)
            return  func({m:'extention'})
        var path = await self.getpath(self.config.path)
        var fxs = new FileWrite()
        console.log('--->',path)
        fxs.create(s.stg,path+'.'+dt.ext,self.config.path)
        fxs.extention=dt.ext
        self.pointers[s.stg.id]=fxs
        return func(null,{i:true})
    }
    upload(msg,func,self)
    {
        var s=msg.session
        var dt=msg.data
        //console.log(msg.session)
        if(!s.stg)
            return func({m:'access'})
        if(!self.pointers[s.stg.id])
            return func({m:'not exist'})
        var i= self.pointers[s.stg.id].write(dt.arr,dt.pos)
        return func(null,{i:i})
    }
    async close(msg,func,self)
    {
        
        var s=msg.session
        var dt=msg.data
        //console.log('---------->',s.stg)
        var p=self.pointers[s.stg.id]
        if(!s.stg)
            return func({m:'access'})
        if(!p)
            return func({m:'not exist'})
        var i= await p.close()
        //console.log('-------->>>',i)
        //console.log('-------->>>',p.size)
        if(self.db)
            await global.db.Save(self.db.dbcontext,self.db.table,['id'],{
                id:s.stg.id,
                path:p.fullPath,
                server:self.config.serverName,
                size:p.size,
                ext:p.extention
                })
        return func(null,{i:i,session:[{name:'stg',value:null}]})
    }
    
}