const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

// sets req.userId if a valid session cookie is present, but never blocks the request
function optionalAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return next();
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
    } catch (err) {
        // ignore invalid/expired token - treat as logged out
    }
    next();
}

module.exports = { requireAuth, optionalAuth };
