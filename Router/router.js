const express=require('express')
const router = express.Router();
const authMiddleware=require('../Middleware/middleware.js')
const {verifyotp,register,login,deletedproduct,addproduct,updateproduct,getproduct,forgotpassword}=require('../Controller/sendemail.js')
router.post('/sendEmail',register)
router.post('/verifyotp',verifyotp)
router.post('/login',login)
router.post('/forgotpassword',forgotpassword)
router.post('/addproduct',authMiddleware,addproduct)
router.get('/getproduct',authMiddleware,getproduct)
router.put('/updateproduct/:id',authMiddleware,updateproduct)
router.delete('/deletedproduct/:id',authMiddleware,deletedproduct)
router.post("/logout",(req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logged out successfully" });
});
module.exports=router