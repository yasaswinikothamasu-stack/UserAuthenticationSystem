const express=require('express')
const router = express.Router();
const {authMiddleware,authorizedRoles}=require('../Middleware/middleware.js')
const {deletedproduct,addproduct,updateproduct,getproduct}=require('../Controller/product.js')
router.post('/addproduct', authMiddleware, authorizedRoles('user','admin'), addproduct);
router.get('/getproduct', authMiddleware, authorizedRoles('user','admin'), getproduct);
router.put('/updateproduct/:id', authMiddleware, authorizedRoles('user','admin'), updateproduct);
router.delete('/deletedproduct/:id', authMiddleware, authorizedRoles('user','admin'), deletedproduct);
module.exports=router