const express=require('express');
const app=express();
const bodyparser=require('body-parser');
const dotenv=require('dotenv');
const mongoose=require('mongoose');
const mongodb=require('mongodb')
const nodemailer=require('nodemailer');
const path = require('path');
const jwt=require('jsonwebtoken');
dotenv.config()

const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());

const authRoutes = require('./Router/router');
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to home!');
});


app.set('view engine',"ejs");
app.set('views', path.join(__dirname, 'views'));

PORT=3000;

mongoose.connect(process.env.Mongo_URL,
     {useNewUrlParser: true,
      useUnifiedTopology: true}
     ).then(()=>console.log("Mongodb connected successfully")).catch((error)=>{console.log(error)})
app.listen(PORT||process.env.PORT,()=>{
    console.log(`Server connected ${PORT}`)
})




