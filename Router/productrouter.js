const express=require('express')
const router = express.Router();
const authMiddleware=require('../Middleware/middleware.js')
const {deletedproduct,addproduct,updateproduct,getproduct}=require('../Controller/product.js')


router.post('/addproduct',authMiddleware,addproduct)
router.get('/getproduct',authMiddleware,getproduct)
router.put('/updateproduct/:id',authMiddleware,updateproduct)
router.delete('/deletedproduct/:id',authMiddleware,deletedproduct)


module.exports=router