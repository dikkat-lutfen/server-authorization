const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express()
const jwt = require("jsonwebtoken");
const port=3040;


app.use(bodyParser.json())
app.use(cors({
    origin:"*",
}))

const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://mongodb:12345@cluster0.hlozv30.mongodb.net/?retryWrites=true&w=majority');
}

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    imageUrl: String,
  });

const User = mongoose.model('User', UserSchema);




app.post("/signup", async (req,res)=>{
  // check if username and password exist

   if(!req.body.username || !req.body.password){
        res.send({message: "please send the data needed"})
   }else{
     // we need to hash password
     const user = await User.find({username:req.body.username}) 
     if(user.length){
       res.send({message: "user already exist"})
     }else{
          bcrypt.hash(req.body.password, 10, function(err, hash) {
          console.log("this is our hash :", hash)
           //res.send({hash:hash})
          const newUser =  new User({username:req.body.username, password: hash})
          newUser.save()
          res.send({message: "we saved new user !!!!!!!!!!!!!!!!!"})
            // Store hash in your password DB.
        });
     }
    };
  //we need to save user to data base return me saved
    }
)

app.post("/login",  async (req,res)=>{
 const user = await User.findOne({username:req.body.username})
 if(user){
    bcrypt.compare (req.body.password, user.password, function(err, result) {
        if(result){
           // res.send(user) bad develoder return username as authentication. this is bad practice
           const token = jwt.sign({ id: user._id }, 'secret',{
            expiresIn: '30s' // expires in 365 days
 
       },
           );
           res.send({token});
        }else{
            res.send({message:false})
        }
       
    });
 }else{
    res.send("wrong username")
 }
}
)


app.post("/verify",  async (req,res)=>{
   console.log(req.body)
   // decrypt the token
   jwt.verify(req.body.token, 'secret', async (err, decoded)=> {
    if(err){
      return res.send({message:"session expired"})
    
    }else{
      console.log(decoded) 
      const userId = decoded.id
       //use the id to get the data of user
       const user = await User.findOne({id:userId})
       const token = jwt.sign({ id: user._id }, 'secret',{
        expiresIn: '30s' // expires in 365 days
      })

      //return the user
      const data = {
        username : user.username,
        token : token
      }
       res.send(data)
    }
    }
   )
  
  

 }
 )



app.listen(port,()=>{
console.log("app is running port :"+ port)
})