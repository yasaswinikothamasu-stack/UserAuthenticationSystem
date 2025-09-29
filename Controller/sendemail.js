const User = require('../Model/usermodel')
const Product=require('../Model/product')
const jwt=require('jsonwebtoken')
const dotenv=require('dotenv')
dotenv.config()
const nodemailer=require('nodemailer')



async function register(req, res)
{
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).send("All fields required");
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    const user = new User({
      name,
      email,
      password,
      otp: otp,
      otpExpiresAt: expiry,
    });
    const savedUser = await user.save();
    const token = jwt.sign({ id: savedUser._id, email: savedUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,      // use true in production (HTTPS)
      sameSite: "strict" // CSRF protection
    });
  
    await savedUser.save();
    console.log("User saved:", savedUser);

    res.status(200).json({ token, message: "OTP Sent to the email" });
    const subject = "Email Verification";
    const message = `Your OTP for email verification is ${otp}. It expires in 10 minutes.`;
    await sendEmail(email, subject, message);

    console.log("Email sent to the user and otp is generated", otp);

  } catch (err) {
    console.error("Error in /sendEmail:", err);
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
      { id: user._id, email: user.email },
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
    console.log(update);
    console.log(token);
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ error: "Server error" });
  }
}


async function addproduct(req,res)
{
    const {name,price,description}=req.body
   const newProduct=await new Product({name,price,description,userId:req.user.id})
    newProduct.save()
    .then(product=>res.status(201).json(product))
    .catch(err=>res.status(500).json({error:err.message}))
}

async function getproduct(req, res){
  try {
    const products = await Product.find({userId:req.user.id}); // or { user: userId } depending on your schema
    // If no products found, products would be an empty array (not null)
    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'No products found for this user' });
    } 
      return res.json(products);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid userId format' });
    }
    return res.status(500).json({ error: err.message });
  }
};


async function updateproduct(req, res)
{
  try {
     
      const { id } = req.params;
     const { name, price, description } = req.body;
    const updated = await Product.findOneAndUpdate(
      { _id: id, userId: req.user.id },   // filter: must match product id *and* user
      { $set: { name, price, description } },
      { new: true, runValidators: true }
    );
    console.log(id);
   console.log(req.user);
    if (!updated) {
      // either product not found, or it doesn't belong to that user
      return res.status(404).json({ error: 'Product not found or not owned by user' });
    }

    res.json(updated);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid id format' });
    }
    res.status(500).json({ error: err.message });
  }
}
async function deletedproduct(req, res)
{
  try {
    // findOneAndDelete using both product _id and owner field
    const { id } = req.params;
    const deleted = await Product.findOneAndDelete(
      { _id: id, userId: req.user.id }
    );
    console.log(id);
    console.log(req.user);
    if (!deleted) {
      // either product not found, or it doesn't belong to that user
      return res.status(404).json({ error: 'Product not found or not owned by user' });
    }
  res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid id format' });
    }
    res.status(500).json({ error: err.message });
  }
};

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
module.exports={register,verifyotp,login,addproduct,getproduct,updateproduct,deletedproduct}

