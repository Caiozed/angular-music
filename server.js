var express = require('express');
var mysql = require('mysql');
var path = require('path');
var bodyParser = require('body-parser');


var app = express();

var con = mysql.createConnection({
  host: process.env.IP,
  user: "caiozed",
  password: "",
  database: "c9"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


app.use(express.static(path.resolve(__dirname, 'client')));
app.use(bodyParser.json());     
app.use(bodyParser.urlencoded({     
  extended: true
})); 

app.post("/new/user", function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var query = "INSERT INTO users (username, password) VALUES (?, ?)";
  con.query(query, [username, password], function(err, result){
    if(err){
      res.send(err);
      console.log(err);
    }else{
      res.send("User created!");
      console.log("User Created");
    }
  });
});

app.post("/login", function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var query = "SELECT * FROM users WHERE username = ? AND password = ?";
  con.query(query, [username, password], function(err, result){
    if(err){
      res.send(err);
      console.log(err);
    }else{
      res.json(result);
      console.log("User sent");
    }
  });
});

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("server listening at", process.env.IP + ":" + process.env.PORT);
});
