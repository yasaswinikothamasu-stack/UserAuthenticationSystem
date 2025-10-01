const express=require('express');
const app=express();
const bodyparser=require('body-parser');
const dotenv=require('dotenv');
const mongoose=require('mongoose');
const mongodb=require('mongodb')
const nodemailer=require('nodemailer');
const path = require('path');
const jwt=require('jsonwebtoken');
const cloudinary = require("cloudinary").v2;
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
});

const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


const productRoutes = require('./Router/productrouter.js');
const authRoutes = require('./Router/authenticationrouter.js');

app.use('/api', authRoutes);
app.use('/api', productRoutes);

PORT=3000;

mongoose.connect(process.env.Mongo_URL,
     {useNewUrlParser: true,
      useUnifiedTopology: true}
     ).then(()=>console.log("Mongodb connected successfully")).catch((error)=>{console.log(error)})
app.listen(PORT||process.env.PORT,()=>{
    console.log(`Server connected ${PORT}`)
})




