const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.authToken

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' })
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded  // Attach decoded user info to request object
        next()
    } 
    catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}
