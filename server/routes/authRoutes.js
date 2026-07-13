const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// in production the frontend (Vercel) and backend (Render) are different domains,
// so the cookie must be SameSite=None (which requires Secure) to be sent cross-site.
// Locally they're both localhost, where SameSite=Lax + non-Secure is what works over http.
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function signToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function respondWithSession(res, user) {
    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);
    const userJson = user.toObject();
    delete userJson.password;
    res.json(userJson);
}

// exchange a Google ID token for our own session cookie
router.post('/google', async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        return res.status(400).json({ message: 'Missing credential' });
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture } = payload;

    try {
        let user = await User.findOne({ googleId });

        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                // existing email/password account signing in with Google for the first time
                user.googleId = googleId;
                user.name = user.name || name;
                user.avatar = user.avatar || picture;
                await user.save();
            } else {
                user = await User.create({
                    googleId,
                    email,
                    name,
                    avatar: picture,
                    username: email.split('@')[0] + '-' + googleId.slice(-5),
                });
            }
        }

        respondWithSession(res, user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// create an account with email + password
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'username, email, and password are required' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'password must be at least 8 characters' });
    }

    try {
        let user = await User.findOne({ email });

        if (user) {
            if (user.password) {
                return res.status(409).json({ message: 'An account with that email already exists' });
            }
            // Google-only account claiming a password for the first time
            user.password = password;
            await user.save();
        } else {
            user = await User.create({ username, email, password });
        }

        respondWithSession(res, user);
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(409).json({ message: `That ${field} is already taken` });
        }
        res.status(400).json({ message: err.message });
    }
});

// sign in with email + password
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const matches = await user.comparePassword(password);
        if (!matches) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        respondWithSession(res, user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// who's currently logged in, based on the cookie
router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.json({ message: 'Logged out' });
});

module.exports = router;
