const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Get token from header
    const token = req.header('x-auth-token');

    // 2. Check if token exists
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. Verify token in memory (Super Fast - NO Database calls here!)
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        // Optional: Differentiate between expired and invalid tokens for better debugging
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token has expired, please log in again' });
        }
        res.status(401).json({ msg: 'Token is not valid' });
    }
};