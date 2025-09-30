const express=require('express')
const router = express.Router();
const {verifyotp,register,login,forgotpassword,logout}=require('../Controller/authentication.js')
//const upload = require('../Middleware/upload.js');

router.post('/register', register);
router.post('/verifyotp',verifyotp)
router.post('/login',login)
router.post('/forgotpassword',forgotpassword)
router.post('/logout',logout)
module.exports=router