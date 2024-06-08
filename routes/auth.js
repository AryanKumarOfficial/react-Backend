const express = require('express');
const User = require("../models/User")
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const jwt_secret = "body('name', 'minimum 3 character name required').isLength({ min: 3 })"

// ROUTE 1: create a user using :"POST" "/api/auth/createuser" Doesn't require login createuser
router.post('/createuser', [
    //    validates the user inputs

    body('name', 'minimum 3 character name required').isLength({ min: 3 }),
    body('email', 'not a valid email').isEmail(),
    body('password', 'password can be 8 to 16 charcter long').isLength({ min: 8, max: 16 }),
    body('userName', "user name can't be less than 5 character").isLength({ min: 5 }),
    body('userName', 'can only contain alphabets and numbers').isAlphanumeric(),
], async (req, res) => {
    let success = false
    // if there are errors, return bad request and err messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    // check weather  user with this email alreafy exists
    try {

        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ success, error: "a user with this email already exists" })
        }
        else {
            const salt = await bcrypt.genSalt(10)
            const secPass = await bcrypt.hash(req.body.password, salt)
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
                userName: req.body.userName
            })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, jwt_secret)
        console.log(authToken);
        success = true
        res.json({ success, authToken })

        // res.json(user)
    }
    catch (error) {
        console.log(error);
        res.status(500).json("Internal Server error")

    }


})


//Route 2: Authenticate a user using :"POST" "/api/auth/login" Doesn't require login 
router.post('/login', [
    //    validates the user inputs
    body('email', 'not a valid email').isEmail(),
    body('email', "email can't be blank").exists(),
    body('password', 'password can be 8 to 16 charcter long').isLength({ min: 8, max: 16 }),
    body('password', "password can't be blank").exists(),
], async (req, res) => {
    // if there are errors, return bad request and err messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body
    try {
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "please try to login with correct credentials" })
        }
        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            success = false
            return res.status(400).json({ success, error: "please try to login with correct credentials" })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, jwt_secret)
        // console.log(authToken);
        success = true
        res.json({ success, authToken })

    } catch (error) {
        console.log(error);
        res.status(500).json("Internal Server error")
    }
}
)

//Route 3: get logged in user details using :"POST" "/api/auth/getuser" requires login 

router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.log(error);
        res.status(500).json("Internal Server get error")
    }
})

module.exports = router;
