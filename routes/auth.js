const router = require("express").Router();
const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

// Register api
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(500).json({
        message: "Please enter all fields"
    })
    try {
        const hashedPassword = await bcrypt.hash(password, 12)
        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword
        })
        const savedUser = await newUser.save()
        res.status(200).json(savedUser)
    } catch (err) {
        res.status(500).json({message: "User already exists"})
    }
})

router.post('/login', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(401).json({
        message: "Please enter all fields"
    })
    try {
        const user = await User.findOne({ username: username })
        //if the user does not exist in db then send error msg to client side
        if (!user) {
            res.status(401).json({ message: 'Please register first' })
        }
        const matchPassword = await bcrypt.compare(password, user.password);
        if (matchPassword) {
            const token = jwt.sign({id:user.id, isAdmin:user.isAdmin}, process.env.jwt_secret)
            
            const {password, ...others} = user._doc;
            res.status(200).json({ token, ...others })
        } else {
            res.status(500).json(err)
        }

    } catch (err) {
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router;