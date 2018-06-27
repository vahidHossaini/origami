var _eval = require('eval')
module.exports = class condition
{
    constructor(cond)
    { 
        this.cond=cond 
    }
    static createCondition(cond)
    {
         var str=this.subCondition(cond)
         console.log('----')
         if(!str)
             str='true'
        return _eval('module.exports = (input)=>{return '+str+'}')
    }
    static subCondition(cond)
    {
        var str=''
        for(var a in cond)
        {
            if(a=='$and' && cond[a].length)
            { 
                str+='('
                for(var b of cond[a])
                {
                    str+= ' '+this.subCondition(b)+' && '
                }
                str=str.substr(0,str.length-3)
                str+=')'
            }
            else if(a=='$or')
            {
                str+='('
                for(var b of cond[a])
                {
                    str+= ' '+this.subCondition(b)+' || '
                }
                str=str.substr(0,str.length-3)
                str+=')' 
            }
            else if(a=='$eq')
            {
                str+= ' = ' + cond[a]
            }
            else if(a=='$ne')
            {
                str+= ' <> ' + cond[a]
            }
            else if(a=='$lt')
            {
                str+= ' < ' + cond[a]
            }
            else if(a=='$lte')
            {
                str+= ' <= ' + cond[a]
            }
            else if(a=='$gt')
            {
                str+= ' > ' + cond[a]
            }
            else if(a=='$gte')
            {
                str+= ' >= ' + cond[a]
            }
            else if(typeof(cond[a])!='object' || cond[a] instanceof Date)
            {
                if(typeof(cond[a])=='string')
                    cond[a]='\''+cond[a]+'\''
                //if()
                    str += '(  input.'+ a +' == ' + cond[a]+')'
            }
            else
            {
                 str += 'input.'+ a +' ' + this.subCondition(cond[a])
            }
            str += ' && '
        }
        str=str.substr(0,str.length-3)
        return str
    }
    static createConditionCheck(cond)
    {
         var str=this.subConditionCheck(cond)
         console.log('module.exports = (input)=>{return '+str+'}')
        return _eval('module.exports = (input)=>{return '+str+'}')
    }
    static subConditionCheck(cond)
    {
        var str=''
        for(var a in cond)
        {
            if(a=='$and' && cond[a].length)
            { 
                str+='('
                for(var b of cond[a])
                {
                    str+= ' '+this.subConditionCheck(b)+' && '
                }
                str=str.substr(0,str.length-3)
                str+=')'
            }
            else if(a=='$or')
            {
                str+='('
                for(var b of cond[a])
                {
                    str+= ' '+this.subConditionCheck(b)+' || '
                }
                str=str.substr(0,str.length-3)
                str+=')' 
            }
            else if(a=='$eq')
            {
                str+= ' = ' + cond[a]
            }
            else if(a=='$ne')
            {
                str+= ' <> ' + cond[a]
            }
            else if(a=='$lt')
            {
                str+= ' < ' + cond[a]
            }
            else if(a=='$lte')
            {
                str+= ' <= ' + cond[a]
            }
            else if(a=='$gt')
            {
                str+= ' > ' + cond[a]
            }
            else if(a=='$gte')
            {
                str+= ' >= ' + cond[a]
            }
            else if(typeof(cond[a])!='object' || cond[a] instanceof Date)
            {
                //if(typeof(cond[a])=='string')
                //    cond[a]='\''+cond[a]+'\''
                //if()
                    str += '(!input || input.'+ a +' == ' + cond[a]+' )'
            }
            else
            {
                 str += '(!input || input.'+ a +' ' + this.subConditionCheck(cond[a])+' )'
            }
            str += ' && '
        }
        str=str.substr(0,str.length-3)
        return str
    }
    check(obj)
    {
        return this.subCheck(obj,this.cond)
    }
    subCheck(obj,cond)
    {
        for(var x in cond)
        {
            let a=cond[x]
                //console.log('x>>',x)
            if(x=='$or')
            {
                for(var b of a)
                {
                //console.log('or>>',b)
                    
                    if(this.subCheck(obj,b))
                    {
                        return true
                    }
                }
                return false
            }
            else if(x=='$and')
            {
                for(var b of a)
                {
                    if(!this.subCheck(obj,b))
                    {
                        return false
                    }
                }
                return true
            }
            else if(typeof(a)!='object' || a instanceof Date)
            {
                //console.log('>>',obj[x])
                //console.log('>>',a)
                //console.log('>>',x)
                if(obj[x] && obj[x]==a)
                    return true
                return false
            }
            else
            {
                if(a['$in'])
                {
                    for(var c of a['$in'])
                    {
                        if(obj[x]==c)
                            return true
                    }
                }
                else if(a['$eq'])
                {
                    if(obj[x]==a['$eq'])
                        return true
                }
                else if(a['$ne'])
                {
                    if(obj[x]!=a['$ne'])
                        return true
                }
                else if(a['$lt'])
                {
                    if(obj[x]<a['$lt'])
                        return true
                }
                else if(a['$lte'])
                {
                    if(obj[x]<=a['$lte'])
                        return true
                }
                else if(a['$gt'])
                {
                    if(obj[x]>a['$gt'])
                        return true
                }
                else if(a['$gte'])
                {
                    if(obj[x]>=a['$gte'])
                        return true
                }
                return false
            }
            return false
        }
    }
}