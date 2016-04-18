var express = require('express');
app = express();

app.listen(8081);
console.log('listening on port 8081....');

app.get('/**',function(req,res){
  if(req.url=='/'){
    res.sendFile(__dirname+'/index.html');
  }else{
    res.sendFile(__dirname+req.path);
  }
});
