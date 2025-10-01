const express=require('express')
const router = express.Router();
const {verifyotp,register,login,forgotpassword,logout,updatepic}=require('../Controller/authentication.js')
//const upload = require('../Middleware/upload.js');
const multer = require("multer");
const cloudinary =require("../config/cloudinary.js");
const fs = require("fs");
const {authMiddleware,authorizedRoles} = require("../Middleware/middleware.js");
const upload = multer({ dest: "uploads/" }); // temp storage
router.post('/register',upload.single("file"), register);
router.post('/verifyotp',verifyotp)
router.post('/login',login)
router.put('/updatepic',authMiddleware,authorizedRoles("user","admin"),upload.single("file"),updatepic)
router.post('/forgotpassword',forgotpassword)
router.post('/logout',logout)
module.exports=router













