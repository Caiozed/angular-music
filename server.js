var express = require('express');
var mysql = require('mysql');
var path = require('path');

var app = express();

mysql.createConnection({
  host: process.env.IP,
  user: "caiozed",
  password: "",
  database: "c9"
});


app.use(express.static(path.resolve(__dirname, 'client')));


app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("server listening at", process.env.IP + ":" + process.env.PORT);
});
