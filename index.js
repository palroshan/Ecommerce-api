const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config();

const authRoute = require('./routes/auth')
const userRoute = require('./routes/user.js')
const productRoute = require('./routes/product')
const cartRoute = require('./routes/cart')
const orderRoute = require('./routes/order')

const app = express();
app.use(express.json())
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute)
app.use("/api/orders", orderRoute)

// connection of mongodb database
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log('Database is connected'))
.catch(err => {console.log(err)})

// listening server on port
app.listen(process.env.PORT || 5000, ()=>{
    console.log('Server is running')
})