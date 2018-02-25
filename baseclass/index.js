var jalaali = require('jalaali-js')
module.exports = class baseclass
{
  constructor(config)
  { 
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

        global.rand= function (min, max) {
          return Math.floor(Math.random() * (max - min)) + min;
        }
        global.config={auth:{},upload:{},captcha:{}}
  }
}