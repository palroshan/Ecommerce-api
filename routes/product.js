const Product = require("../models/Product");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();

// create product
// title: { type: String, required: true, unique: true },
// desc: { type: String, required: true },
// img: { type: String, required: true },
// categoreis: { type: Array },
// size: { type: String },
// color: { type: String },
// price: { type: String, required: true },

router.post('/addproduct', verifyTokenAndAdmin, async(req, res)=>{
    const {title, desc, img, price, categories, size, color} = req.body;
    if(!title || !desc || !img || !price){
        return res.status(403).json({message: "Please add all the fields"})
    }
    try{
        const product = await Product.findOne({title:title})
        if(product){
            return res.status(403).json({message: "Product with this title already exists"})
        } else {
            const newProduct = new Product(req.body)
            // save to db
            let savedProduct=await newProduct.save();
            return res.status(201).json(savedProduct)
        }
    } catch (err) {
        res.status(500).json("Internal error occured")
    }
})

// Update prodcut
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body
            },
            { new: true });
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
})

router.delete('/:id', verifyTokenAndAdmin, async (req, res)=>{
    try{
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"Product deleted successfully"})
    } catch(err){
        res.status(500).json(err)
    }
})

// getting product
router.get('/:id', async (req, res) => {
    try {
        let product = await Product.findById(req.params.id)
        res.status(200).json(product)
    } catch (err) {
        res.status(500).json(err);
    }
})

// GET all products
router.get('/', async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.categories;
    try {
        let product = [];
        if(qNew){
            product = await Product.find().sort({createdAt: -1}).limit(5);
        } else if(qCategory){
            product = await Product.find({
                categories:{$in:[qCategory]}
            })
        } else {
            product = await Product.find()
        }
        res.status(200).json(product)
    } catch (err) {
        res.status(500).json(err);
    }
})
module.exports = router;