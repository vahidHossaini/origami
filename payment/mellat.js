const Mellat = require( 'mellat-payment' );
module.exports=class mellatService 
{
    constructor(config,dist)
    {
        this.terminal=config.terminal    
        this.username=config.username    
        this.password=config.password    
        this.amount=config.amount
        this.verify=config.verify 
    }
    getData(msg,func,self)
    {
        var dt=msg.data
        if(!this.verify && !dt.verify)
            return func({message:'pay001'})
            
    }
    purchase(msg,func,self)
    {
        
    }
}