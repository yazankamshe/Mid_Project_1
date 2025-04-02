const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
    const token = req.cookies.token;  // Read token from cookies

    if (!token) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
      
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { protect };
