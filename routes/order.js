const Order = require("../models/Order");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();

router.post('/', verifyToken, async (req, res) => {
    const newOrder = new Order(req.body);
    try {
        console.log(newOrder)
        // save to db
        const savedOrder = await newOrder.save();
        return res.status(201).json(savedOrder)
    } catch (err) {
        res.status(500).json("Internal error occured")
    }
})

// Update prodcut
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body
            },
            { new: true });
        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
})

router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Order deleted successfully" })
    } catch (err) {
        res.status(500).json(err)
    }
})

// GET USER ORDER
router.get('/find/:userId', verifyTokenAndAuthorization, async (req, res) => {
    try {
        let orders = await Order.find({ userId: req.params.userId })
        res.status(200).json(orders)
    } catch (err) {
        res.status(500).json(err);
    }
})

// GET all 
router.get('/', verifyTokenAndAdmin, async (req, res) => {

    try {
        const orders = await Order.find();
        res.status(200).json(orders)
    } catch (err) {
        res.status(500).json(err);
    }
})

// GET MONTHLY INCOME
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1))
    const previousMonth = new Date(date.setMonth(lastMonth.getMonth() - 1))
    try {
        const income = await Order.aggregate([
            { $match: { createdAt: { $gte: previousMonth } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    sales: "$amount"
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: {$sum: "$sales"}
                }                
            }
        ])
        res.status(200).json(income)
    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = router;