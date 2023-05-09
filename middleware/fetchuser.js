const jwt = require('jsonwebtoken');
const jwt_secret = "body('name', 'minimum 3 character name required').isLength({ min: 3 })"

const fetchuser = (req, res, next) => {
    // get the user from the jwt token and id to the req body
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).send({ error: "Please authenticate with valid token" })
    }
    try {
        const data = jwt.verify(token, jwt_secret)
        req.user = data.user
        next()
    } catch (error) {
        res.status(401).send({ error: "Please authenticate with valid token" })

    }

}

module.exports = fetchuser