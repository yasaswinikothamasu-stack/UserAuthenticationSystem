const ProductSchema=new mongoose.Schema({
    name:{type:String,required:true},
    price:{type:Number,required:true},
    description:{type:String,required:true},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}

})
module.exports=mongoose.model('Product',ProductSchema)