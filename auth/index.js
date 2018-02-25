
module.exports = class auth
{
  constructor(config,dist)
  {
    if(config.userpass)
    {
      this.userpass=new (require('./userpass.js'))(config.userpass)
    }
    dist.addFunction('auth','login',this.login,this)
    dist.addFunction('auth','logout',this.logout,this)
    dist.addFunction('auth','create',this.create,this)
    dist.addFunction('auth','islogin',this.islogin,this)
    dist.addFunction('auth','getusers',this.getusers,this)
    dist.addFunction('auth','updateuser',this.updateuser,this)
    dist.addFunction('auth','register',this.register,this)
    dist.addFunction('auth','changePassword',this.changePassword,this)
    dist.addFunction('auth','forgetPassword',this.forgetPassword,this)
    dist.addFunction('auth','resetPassword',this.resetPassword,this)
    dist.addFunction('auth','verify',this.verify,this)
    dist.addFunction('auth','twoStep',this.twoStep,this)
    
    global.auth['auth']={
        'login':'public',
        'islogin':'public',
        'register':'public',
        'resetPassword':'public',
        'verify':'public',
        'twoStep':'public',
        'logout':'login',
        'forgetPassword':'public'
        
        }
    
    
  }
  islogin(msg,func,self)
  {
      var session=msg.session 
      if(!session.userid)
      {
          return func(null,{isDone:false})
      }
      return func(null,{isDone:true})
  }
  login(msg,func,self)
  {
      self.userpass.login(msg,func)
  }
  logout(msg,func,self)
  {
    self.userpass.logout(msg,func)
  }
  create(msg,func,self)
  {
    self.userpass.create(msg,func)
  }
  getusers(msg,func,self)
  {
    self.userpass.getusers(msg,func)
  }
  updateuser(msg,func,self)
  {
    self.userpass.updateuser(msg,func)
  }
  register(msg,func,self)
  {
    self.userpass.register(msg,func)
  }
  changePassword(msg,func,self)
  {
    self.userpass.changePassword(msg,func)
  }
  forgetPassword(msg,func,self)
  {
    self.userpass.forgetPassword(msg,func)
  }
  resetPassword(msg,func,self)
  {
    self.userpass.resetPassword(msg,func)
  }
  verify(msg,func,self)
  {
    self.userpass.verify(msg,func)
  }
  twoStep(msg,func,self)
  {
    self.userpass.twoStep(msg,func)
  }
}
