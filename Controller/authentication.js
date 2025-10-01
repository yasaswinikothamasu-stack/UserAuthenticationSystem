 const express=require('express')
 const app=express();
 app.use(express.json());
 app.use(express.urlencoded({ extended: true }));
const User = require('../Model/usermodel')
const multer = require("multer");
const cloudinary =require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
});
const fs = require("fs");
const jwt=require('jsonwebtoken')
const dotenv=require('dotenv')
dotenv.config()
const nodemailer=require('nodemailer')
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set in your .env file
});

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).send("All fields required");
    }

    let profilePicUrl = " "; // default
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "user_uploads",
      });
      fs.unlinkSync(req.file.path);
      profilePicUrl = result.secure_url;
    }
    console.log(profilePicUrl);

    // 2️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // 3️⃣ Save user
    const user = new User({
      name,
      email,
      password, // hash in production
      profilePic: profilePicUrl,
      role,
      otp,
      otpExpiresAt,
    });
    const savedUser = await user.save();

    // 4️⃣ Send OTP email
    await sendEmail(
      email,
      "Email Verification",
      `Your OTP for email verification is ${otp}. It expires in 10 minutes.`
    );

    // 5️⃣ Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    // 6️⃣ Send final response
    res.status(200).json({
      token,
      message: "Registration successful, OTP sent to email",
    });

    console.log("User saved:", savedUser, "OTP sent:", otp);
  } catch (err) {
    console.error("Error in /register:", err);
    res.status(500).send("Error during registration and OTP sending");
  }
}

 async function verifyotp(req, res)
 {
  try{
     const {Otp,UserId}=req.body
     if(!Otp){
         return res.send("please Enter your verification code")
     }
     const verify=await User.findById(UserId)
     if(verify.otp!=Otp)
     {
       res.send("Wrong otp")  
     }
     await User.findByIdAndUpdate(
         UserId,
       { isverified: true },   
       { new: true }           
     );
    res.status(200).json({message:"OTP verified successfully,User registered"})
   }
   catch(err)
   {
      console.log(err);
   }
  };
 
  async function login(req, res) {
   try {
     const { email, password } = req.body;
     if (!email || !password) {
       return res.status(400).json({ error: "Please fill all the required details" });
     }
 
     const user = await User.findOne({ email });
     if (!user) {
       return res.status(400).json({ error: "User not found" });
     }
     if (!user.isverified) {
       return res.status(403).json({ error: "User email not verified" });
     }
 
     const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
      res.cookie("jwt", token, {
       httpOnly: true,
       secure: false,      // use true in production (HTTPS)
       sameSite: "strict" // CSRF protection
     });
     
   await User.findByIdAndUpdate(user._id, { token }, { new: true });
     res.status(200).json({
       message: "User logged in successfully",
       token
     });
     console.log(token);
   } catch (err) {
     console.error("Error in login:", err);
     res.status(500).json({ error: "Server error" });
   }
 }
async function askgpt(req, res) {
    const answer = await getChatResponse(req.body.prompt);
    res.json({ answer });
}

async function getChatResponse(prompt) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
    });
    return response.choices[0].message.content;
}
 
 async function updatepic(req,res){
   try{
    const user=await User.findById(req.user.id);
    if(!user)
    {
      return res.status(400).json({error:"user not found"})
    }
    if(req.file)
    {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "user_uploads", 
       });
     fs.unlinkSync(req.file.path);
     user.profilePic=result.secure_url;
     await user.save();
     res.status(200).json({message:"profile pic updated successfully",profilePic:user.profilePic})
    }
  } 
   catch(err){
     console.log(err);
   }

 }

 async function forgotpassword(req,res)
 {
 try{
   const {email,oldpassword,newpassword}=req.body
   if(!email)
   {
     return res.status(400).json({error:"please enter your email"})
   }
   const user=await User.findOneAndUpdate({email},{password:newpassword},{new:true})
   if(!user)
   {
     return res.status(400).json({error:"user not found"})
   }
   res.status(200).json({message:"password changed successfully"})
 }
 catch(err)
 {
   console.log(err);
 } }

async function logout(req,res){
    res.clearCookie("jwt");
    res.json({ message: "Logged out successfully" });
 }

 const sendEmail=async(email,subject,message)=>
  {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_PASSWORD
    },
  });
 
  const info = await transporter.sendMail({
  from: process.env.MY_EMAIL,
  to:email,
  subject: subject,
  text:message
});
console.log("Message sent: %s", info.messageId);
}

module.exports={register,verifyotp,login,forgotpassword,logout,updatepic,askgpt}
 
 