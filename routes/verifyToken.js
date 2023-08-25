const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ message: "Your are not authenticated" })
    } else {
        const token = authorization.replace('Bearer ', "");
        jwt.verify(token, process.env.jwt_secret, (err, result) => {
            if (!err) {
                req.user = result;
                next();
            } else {
                res.status(403).json(err)
            }
        })
    }
}

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, ()=>{
        if(req.user.id === req.params.id || req.user.isAdmin){
            next();
        } else {
            res.status(401).json({message: "You are unauthorized"})
        }
    })
}

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, ()=>{
        if(req.user.isAdmin){
            next();
        } else {
            res.status(401).json({message: "You are unauthorized"})
        }
    })
}

module.exports = {verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin};