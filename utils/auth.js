const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash a plain text password
 * @param {string} plainPassword - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 */
exports.hashPassword = async (plainPassword) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainPassword, salt);
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} plainPassword - The plain text password to check
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match
 */
exports.comparePassword = async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generate a JWT token for a user
 * @param {string} userId - The user's ID to encode in the token
 * @returns {string} The generated JWT token
 */
exports.generateToken = (userId) => {
    return jwt.sign(
        { userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
    );
};