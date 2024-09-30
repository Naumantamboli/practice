const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/newtest', { useNewUrlParser: true, useUnifiedTopology: true });
    
    const Post = mongoose.model('Post', {
        text: String,
        image: {
            data: Buffer,
            contentType: String,
        },
        like:{
          type:Number,
          default:0
        }
    });


    const storage = multer.memoryStorage();
    const upload = multer({ storage });


app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());


app.get('/',(req,res)=>{
    res.render("cover");
});

app.get('/postpage',async(req,res)=>{
  let response = await Post.find({}).sort({_id:-1});
  console.log(response);
  res.render("postpage",{posts:response});
});


app.post('/search',async(req,res)=>{
  let startupname = req.body.searchele;
  console.log(startupname);
  const result = await fetch("http://localhost:5000/search", {
      method: "post",
      body: JSON.stringify({startupname}),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
      .then((data) => {
        console.log(data);
        res.render("startupHome",{articals:data.data});
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        res.render('index');
      });
});


app.post('/searchmentor',async(req,res)=>{
  let programname = req.body.searchele;
  console.log(programname);
  const result = await fetch("http://localhost:5000/searchmentor", {
      method: "post",
      body: JSON.stringify({programname}),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
      .then((data) => {
        console.log(data);
        res.render("mentorshipHome",{mentorprograms:data.data});
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        res.render('index');
      });
});

app.post('/upload', upload.single('myImage'), async (req, res) => {
  try {
      const { text } = req.body;
      const image = req.file;

      const newPost = new Post({
          text,
          image: image
              ? {
                  data: image.buffer,
                  contentType: image.mimetype,
              }
              : undefined,
      });
      await newPost.save();
      res.redirect('/postpage');
  } catch (error) {
      console.error('Error uploading post:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


app.get('/images/:id', async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);

      if (!post || !post.image) {
          return res.status(404).send('Image not found');
      }

      res.set('Content-Type', post.image.contentType);
      res.send(post.image.data);
  } catch (error) {
      console.error('Error retrieving image:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});



app.get('/login',(req,res)=>{
  res.render("login");
});

app.post('/authuser',async(req,res)=>{
  let email = req.body.email;
  let password = req.body.password;
  const result = await fetch("http://localhost:5000/authuser", {
      method: "post",
      body: JSON.stringify({email,password}),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if(data.status == "user Authenticated Successfully"){
          res.redirect('postpage');
        }else{
          res.render("login");
        }
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        res.render('index');
      });
});

app.get('/signup',async(req,res)=>{
    res.render("signup");
});

app.post('/registeruser',async(req,res)=>{
    console.log("request arrived");
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let username = req.body.username;
    let password = req.body.password;
    let result = await fetch("http://localhost:5000/registeruser", {
      method: "post",
      body: JSON.stringify({name,email,phone,username,password}),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(()=>{
        console.log("request done");
        res.render("login");
    });
});


app.get("/openings", (req, res) => {
  res.render("openings.ejs"); // Make sure the EJS file path is correct
});

app.listen(port,(req,res)=>{
    console.log(`server is live on port ${port}`);
});