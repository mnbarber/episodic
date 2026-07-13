const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { uploadBuffer, deleteByUrl } = require('../services/s3');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('File must be an image'));
        }
        cb(null, true);
    },
});

// list/search users (for finding people to follow) - public profile fields only
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const filter = search ? { username: { $regex: search, $options: 'i' } } : {};
        const users = await User.find(filter).select('-password -email -googleId').limit(50);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// public profile lookup by username
router.get('/username/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password -email -googleId');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// update your own profile (bio, top shows)
router.put('/me', requireAuth, async (req, res) => {
    const { bio, topShows } = req.body;
    if (topShows && topShows.length > 5) {
        return res.status(400).json({ message: 'You can only pick up to 5 top shows' });
    }

    try {
        const user = await User.findById(req.userId);
        if (bio !== undefined) user.bio = bio;
        if (topShows !== undefined) user.topShows = topShows;
        await user.save();
        const userJson = user.toObject();
        delete userJson.password;
        res.json(userJson);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// upload/replace your own avatar
router.post('/me/avatar', requireAuth, (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const user = await User.findById(req.userId);
        const ext = req.file.mimetype.split('/')[1];
        const key = `avatars/${req.userId}-${Date.now()}.${ext}`;
        const url = await uploadBuffer(key, req.file.buffer, req.file.mimetype);

        const oldAvatar = user.avatar;
        user.avatar = url;
        await user.save();

        if (oldAvatar) {
            deleteByUrl(oldAvatar).catch((err) => console.error('Failed to clean up old avatar:', err.message));
        }

        const userJson = user.toObject();
        delete userJson.password;
        res.json(userJson);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// delete your own account
router.delete('/:id', requireAuth, async (req, res) => {
    if (req.params.id !== req.userId) {
        return res.status(403).json({ message: 'Cannot delete another user' });
    }
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;