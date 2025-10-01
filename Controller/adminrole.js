const Product = require('../Model/product.js');
const User = require('../Model/usermodel.js'); // your User model
async function productUsers(req, res) {
    try {
        const products = await Product.find().populate('userId', 'name email role'); // populate user details
        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        // Map users from products
        const users = products.map(p => p.userId);

        res.json({ users }); // returns array of user objects
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateuserRole(req, res) {
    try{
        const { userId } = req.params;
        const user = await User.findById(userId);
        const update=await User.findByIdAndUpdate(userId,{role:'admin'},{new:true});
        if(!user)
        {
            return res.status(404).json({message:"User not found"});
        }
        if(!update)
        {
            return res.status(400).json({message:"User role not updated"});
        }
        res.status(200).json({message:"User role updated successfully", user: update});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}
async function deleteuser(req,res){
    try{
        const {userId}=req.params;
        const user=await User.findById(userId);
        if(!user)
        {
            return res.status(404).json({message:"User not found"});
        }
        await User.findByIdAndDelete(userId);
        res.status(200).json({message:"User deleted successfully"});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
module.exports = { productUsers, updateuserRole, deleteuser };
