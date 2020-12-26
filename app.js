const express =  require("express");
const https = require("https");
const crypto = require("crypto"); // password hashing
const fs = require("fs") // file system

const app = express();


app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

var db = fs.readFileSync("db.json");
var dbPosts = fs.readFileSync("db-posts.json");
var userDetails = JSON.parse(db);
var postStorage = JSON.parse(dbPosts);

var userPosts = [];

app.get("/", function(req, res){
  res.sendFile(__dirname + "/mainPage.html")
});


app.get("/signUp", function(req, res){
  res.sendFile(__dirname + "/signUp.html");
});

app.get("/login", function(req, res){
  res.sendFile(__dirname + "/login.html");
});

app.get("/success", function(req, res){
  res.json("success");
})

app.get("/postPage", function(req, res) {
  res.sendFile(__dirname + "/postPage.html")
})


app.post("/signUp", function(req, res){
  var newUser = {
    fName:    req.body.fName,
    lName:    req.body.lName,
    email:    req.body.email,
    password: crypto.createHash('sha256').update(req.body.password).digest('hex')
  }

  for (var i=0; i<userDetails.length; i++) {
    if(userDetails[i].email.toLowerCase() === req.body.email.toLowerCase()){

      return res.json("user exists");
    }
  }


  userDetails.push(newUser);
  console.log(userDetails);
  fs.writeFileSync("db.json", JSON.stringify(userDetails, " ", 2));
  res.redirect("/success")
});

app.post("/login", function(req, res){

  var password = crypto.createHash('sha256').update(req.body.password).digest('hex');

  for (var i=0; i<userDetails.length; i++) {
    if(userDetails[i].email.toLowerCase() === req.body.email.toLowerCase()){
      if(userDetails[i].password === password){
        console.log(postStorage[i].content) // get the content from db
        res.redirect("/postPage") //res.sendFile(__dirname + "/postPage"); <-- pushes the page but doesn't change the end point.
        //push content with .replace to postPage here
        return
      }else {
        return res.json("email or password invalid")// if user or password doesn't exist in db
      }
    }
  }
  res.json("email or password invalid") // ????

  for(var i=0; i<postStorage.length; i++){
    if(req.body.email.toLowerCase() === postStorage.email.toLowerCase()){
        displayedContent = "<p>" + postStorage.content + "</p>";
    }
}
});

app.post("/postPage", function(req, res) {

  var newPost = {
    content  : req.body.newPost,
    email    : req.body.email,
    password : crypto.createHash('sha256').update(req.body.password).digest('hex')
  }

  for(var i=0; i<userDetails.length; i++) {
    if(userDetails[i].email.toLowerCase() === newPost.email.toLowerCase()){
      if(userDetails[i].password === newPost.password){
        userPosts.push(newPost)
        var postDisplayPage = fs.readFileSync(__dirname + "/postPage.html", "utf8"); // Stores the required file temporarily
        var displayedContent = "<p>"; // displayedContent = <p>
        displayedContent += newPost.content; // displayedContent = <p> newPost.content
        displayedContent += "</p>" // displayedContent = <p> newPost.content </p>
        postDisplayPage = postDisplayPage.replace("[POSTAREA]", displayedContent)
        res.send(postDisplayPage) // sends a the updated page with a replaced [POSTAREA]
      }else {
        return res.json("email or password invalid") // replace with a page
      }
    }
    console.log(newPost)
  }
  postStorage.push(newPost); // pushes the newPost object into the db-posts.json to save file on hdd
  console.log(postStorage);
  fs.writeFileSync("db-posts.json", JSON.stringify(postStorage, " ", 2));
  res.redirect("/success"); // <-- WARNING: Doesn't work for some reason.
});

app.listen(3000, function(){
  console.log("server is now running on port 3000")
})
