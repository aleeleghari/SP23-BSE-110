const express = require("express");
let server = express();

server.set("view engine","ejs");

server.use(express.static("public"));

server.get("/",(req,res)=>{
  res.render("adidas");
});

server.get("/cv",(req,res)=>{
    res.render("cv");
});

server.listen(5002,()=>{
  console.log("Project deployed at localhost:5002");
})
