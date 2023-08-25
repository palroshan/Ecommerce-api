const User = require("../models/User");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

const router = require("express").Router();

// GET stats of the user
router.get('/stats', verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
    console.log(lastYear);
    try {
        const data = await User.aggregate([
            {
                $addFields: {
                    createdAtDate: {
                        $toDate: "$createdAt" // Convert string to Date
                    }
                }
            },
            { $match: { createdAtDate: { $gte: lastYear } } },
            { $project: { month: { $month: "$createdAtDate" } } },
            { $group: { _id: "$month", total: { $sum: 1 } } },
        ]);
        console.log(data);
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.put('/updateuser/:id', verifyTokenAndAuthorization, async (req, res) => {
    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 12)
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body
            },
            { new: true });
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: "Username or email id is taken", err });
    }
})

router.delete('/:id', verifyTokenAndAuthorization, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: "User deleted successfully" })
    }
    catch (err) {
        res.status(500).json(err);
    }
})
// getting  user by id
router.get('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        let user = await User.findById(req.params.id)
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others })
    } catch (err) {
        res.status(500).json(err);
    }
})

// getting all users by admin
router.get('/', verifyTokenAndAdmin, async (req, res) => {
    const query = req.query.new;
    try {
        const users = query ? await User.find().sort({ _id: -1 }).limit(5) : await User.find();

        res.status(200).json(users)
    } catch (err) {
        res.status(500).json(err);
    }
})


module.exports = router;