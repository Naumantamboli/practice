const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const userdata = require('./models/userdata');
const multer = require('multer');


mongoose.connect("mongodb://localhost:27017/usersdb");

const storage = multer.memoryStorage();

const app = express();

app.set('view engine','ejs');
app.use(express.json());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
const port = 5000;

app.get('/',(req,res)=>{
    res.render("index");
});

app.post('/authuser',async(req,res)=>{
    try{
    let response = await userdata.findOne({email:req.body.email});
    if(response != null){
        if(response.password == req.body.password){
            res.send({status:"user Authenticated Successfully"});
        }else{
            res.send({status:"password incorrect"});
        }
    }else{
        res.send({status:"user not found"});
    }
    }catch(err){
        res.send({status:err});
    }
});

app.post('/registeruser',async(req,res)=>{
    console.log("request arrived");
    let user = new userdata();
    user.name = req.body.name;
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.username = req.body.username;
    user.password = req.body.password;
    let result = await user.save();
    console.log(result);
    res.send("user registered successfully");
});


app.listen(port,(req,res)=>{
    console.log(`server is live on port ${port}`);
});