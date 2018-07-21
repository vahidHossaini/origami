var a=require('./sharememory.js')
var b= new a()
console.log('startup at id : '+process.pid)
b.init('localhost',14000,'sample',(n,v)=>{
    console.log('change =>'+process.pid+'  : ',n,v)
})
const http = require('http');
  http.createServer((req, res) => {
    res.writeHead(200);
    console.log('SendData -------------=====')
    b.setData('profile',{name:'vahid'})
    res.end('hello world\n'); 
  }).listen(8000);