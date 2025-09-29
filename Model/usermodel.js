const mongoose=require('mongoose')
const Userschema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    isverified:{type:Boolean,default:false},
    otp:{type:String,default:null},
    otpExpiresAt:{
        type:Date,
        default:null
    },
    Token:{type:String,default:null}
})
module.exports=mongoose.model('User',Userschema)
