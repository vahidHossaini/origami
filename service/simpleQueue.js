var uuid=require('uuid')
module.exports = class simpleQueue
{
    constructor()
    {
        this.queues={} 
        this.func={}
       
    }
    addQueue(queueName)
    {
        if(!this.queues[queueName])
            this.queues[queueName]=[]
    }
    add(queueName,domain,message,func)
    { 
        this.queues[queueName].push({message:message,func:func,domain:domain})
    }
    pop(queueName)
    {
        if(this.queues[queueName].length==0)
            return null;
        var msg=this.queues[queueName].splice(0,1)[0]
        return msg
    }
}