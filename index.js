var dist =new (require('./distributer/index'))()
global.auth={}
global.authz={}
module.exports = class origami
{
  constructor(config)
  { 
    for(var a of config)
    {
      //console.log('NAme')
      //console.log(a.name)
      new (require('./'+a.name+'/index'))(a,dist)
    }
  }
}
