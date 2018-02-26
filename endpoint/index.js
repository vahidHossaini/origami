
module.exports = class endpoint
{
  constructor(config,dist)
  {
    if(config.express)
    {
        for(var a of config.express)
        {
            var exp=new(require('./express.js'))(a,dist)            
        }
    }
    if(config.telegram)
    {
        for(var a of config.telegram)
        {
            var exp=new(require('./telegram.js'))(a,dist)            
        }
    }
    if(config.socket)
    {
        for(var a of config.socket)
        {
            var exp=new(require('./socket.js'))(a,dist)            
        }
    }
  }
}
