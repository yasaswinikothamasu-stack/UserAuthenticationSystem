const mongoose=require('mongoose')
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profilePic: { type: String },
  otp: String,
  otpExpiresAt: Date,
  isverified: { type: Boolean, default: false },
});
module.exports=mongoose.model('User',userSchema)
