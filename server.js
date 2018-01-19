var express = require('express');
var mysql = require('mysql');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');

var app = express();

var con = mysql.createConnection({
  host: process.env.IP,
  user: "caiozed",
  password: "",
  database: "c9"
});

var upload = multer({ dest: 'uploads/' });

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


app.use(express.static(path.resolve(__dirname, 'client')));
app.use(bodyParser.json());     
app.use(bodyParser.urlencoded({     
  extended: true
})); 

app.use(function(req, res, next) {
//set headers to allow cross origin request.
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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

app.post("/new/album", upload.single('image'), function(req, res){
  var name = req.body.name;
  var image_path = req.file.path;
  console.log(req.file.path);
  var artist_id = req.body.artist_id;
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
