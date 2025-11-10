/**
 * Set the authentication cookie on the response
 * @param {object} res - Express response object
 * @param {string} token - JWT token to set in cookie
 */
exports.setAuthCookie = (res, token) => {
    res.cookie("authToken", token, { 
        httpOnly: true, 
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};