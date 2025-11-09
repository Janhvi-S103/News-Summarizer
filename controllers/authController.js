const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logging');

// registering a user
exports.register = async (req, res) => 
{
    try {

        const { password, username } = req.body;

        // Check if user already exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash the passowrd
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        user = new User({username,password:hashedPassword})
        await user.save()

        // create jwt token
        const payload = { userId: user._id }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d'
        })

        // setting the cookie
        res.cookie("authToken", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
        res.status(201).json({ message: 'Registration successful' })
    }
    catch(error) {
        res.status(500).json({ message: error.message })
    }
}

// loign handling
exports.login = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        logger.info(`Login attempt for user: ${username}`);

        if (!username || !password) {
            logger.warn({
                event: 'failed_login',
                reason: 'missing_credentials',
                username
            });
            return res.status(400).json({ message: 'Missing credentials' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            logger.warn({
                event: 'failed_login',
                reason: 'user_not_found',
                username
            });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            logger.warn({
                event: 'failed_login',
                reason: 'invalid_password',
                username
            });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        logger.info({
            event: 'successful_login',
            userId: user._id,
            username
        });

        res.cookie('token', token, { httpOnly: true });
        res.json({ message: 'Login successful' });
    } catch (error) {
        logger.error({
            event: 'login_error',
            error: error.message,
            stack: error.stack,
            username
        });
        res.status(500).json({ message: 'Server error' });
    }
};
