var jalaali = require('jalaali-js')
module.exports = class baseclass
{
    constructor(config)
    { 
        this.setup() 
        
    }
     
  setup()
  {
      global.consoleColor={
          red:"\x1b[31m%s\x1b[0m",
          green:"\x1b[32m%s\x1b[0m",
          yellow:"\x1b[33m%s\x1b[0m",
          blue:"\x1b[34m%s\x1b[0m",
          white:"\x1b[37m%s\x1b[0m",
          cyan:"\x1b[36m%s\x1b[0m",
      }
      global.trace=function trace(s) {
                    const orig = Error.prepareStackTrace;
                    Error.prepareStackTrace = (_, stack) => stack;
                    const err = new Error();
                    Error.captureStackTrace(err, arguments.callee);
                    Error.prepareStackTrace = orig;
                    const callee = err.stack[0];
                    process.stdout.write(`${path.relative(process.cwd(), callee.getFileName())}:${callee.getLineNumber()}: ${s}\n`);
                }
      global.web=new (require('./web'))()
        global.Log=function(title,err){
          console.log('-------'+title);
          console.log(err);
          console.log('-------------------');
        };
        global.toPersian=function(dt)
        {
            var day=dt.getDate()
            var mon=dt.getMonth()+1
            var year=dt.getFullYear()
            var dst=jalaali.toJalaali(year, mon, day)
            return ({year:dst.jy,month:dst.jm,day:dst.jd})
        }
        String.prototype.replaceAll = function(search, replacement) {
          var target = this;
          return target.replace(new RegExp(search, 'g'), replacement);
        };
        String.prototype.replaceAt=function(index, replacement) {
          return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
        }
        global.round=function(number,p=10){
            return Math.round(number*p)/p
        }
        global.rand= function (min, max) {
          return Math.floor(Math.random() * (max - min)) + min;
        }
        global.randString=function Getrand(n=12)
        {
            var str=''
            var sr='1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
            for(var a=0;a<n;a++)
            {
                var i= global.rand(0,sr.length)
                str+=sr[i]
            }
            return str
        }
        global.randNumber=function Getrand(n=12)
        {
            var str=''
            var sr='1234567890'
            for(var a=0;a<n;a++)
            {
                var i= global.rand(0,sr.length)
                str+=sr[i]
            }
            return str
        }
        global.config={auth:{},upload:{},captcha:{}}
        
        global.addMin=function (date,min)
        {
            return new Date(date.getTime()+1000*60*min) 
        }
        global.updateArray=function(arr,key,obj)
        {
            for(var a=0;a<arr.length;a++)
            {
                var dt=arr[a]
                let ism=true
                for(var b of key)
                {
                    if(dt[b]!=obj[b])
                        ism=false
                }
                if(ism)
                {
                    arr[a]=obj
                    return 
                }
            }
            arr.push(obj)
        }
        global.deleteArray=function(arr,key,obj)
        {
            for(var a=0;a<arr.length;a++)
            {
                var dt=arr[a]
                let ism=true
                for(var b of key)
                {
                    if(dt[b]!=obj[b])
                        ism=false
                }
                if(ism)
                {
                    arr.splice(a,1)
                    return 
                }
            } 
        }
  
  }
}