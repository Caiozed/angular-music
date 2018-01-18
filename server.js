var express = require('express');
var mysql = require('mysql');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');

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

app.post("/new/album", function(req, res){
  var name = req.body.name;
  var image = req.body.image;
  console.log(image);
  var artist_id = req.body.artist_id;
  fs.writeFile("/", image, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
  }); 
  // var query = "INSERT INTO albums (name image artist_id) VALUES (?, ?, ?)";
  // con.query(query, [name, image_path, artist_id], function(err, result){
  //   if(err){
  //     res.send(err);
  //     console.log(err);
  //   }else{
  //     res.send("Albums added");
  //     console.log("Albums added");
  //   }
  // });
});

app.get("/albums", function(req, res){
  var query = "SELECT * FROM albums LIMIT 50";
  con.query(query, function(err, result){
    if(err){
      res.send(err);
      console.log(err);
    }else{
      res.json(result);
      console.log("Albums sent");
    }
  });
});

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("server listening at", process.env.IP + ":" + process.env.PORT);
});
