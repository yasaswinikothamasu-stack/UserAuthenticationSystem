const express = require('express');
const router = express.Router();
const {authMiddleware,authorizedRoles} = require('../Middleware/middleware');
const { productUsers,updateuserRole,deleteuser } = require('../Controller/adminrole');
router.get('/admin/products',authMiddleware,authorizedRoles('admin'),productUsers);
router.put('/admin/promote/:userId',authMiddleware,authorizedRoles('admin'),updateuserRole);
router.delete('/admin/delete/:userId',authMiddleware,authorizedRoles('admin'),deleteuser);
module.exports = router;
