const express=require('express')
const app=express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const Product=require('../Model/product')
const jwt=require('jsonwebtoken')
const dotenv=require('dotenv')
dotenv.config()

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

module.exports={addproduct,getproduct,updateproduct,deletedproduct}
