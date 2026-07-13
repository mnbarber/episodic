const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const { requireAuth } = require('../middleware/auth');

// public: who follows this user
router.get('/:userId/followers', async (req, res) => {
    try {
        const follows = await Follow.find({ following: req.params.userId })
            .populate('follower', 'username name avatar');
        res.json(follows.map((f) => f.follower));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// public: who this user follows
router.get('/:userId/following', async (req, res) => {
    try {
        const follows = await Follow.find({ follower: req.params.userId })
            .populate('following', 'username name avatar');
        res.json(follows.map((f) => f.following));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// does the current user follow :userId
router.get('/:userId/status', requireAuth, async (req, res) => {
    try {
        const follow = await Follow.findOne({ follower: req.userId, following: req.params.userId });
        res.json({ isFollowing: !!follow });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/:userId', requireAuth, async (req, res) => {
    if (req.params.userId === req.userId) {
        return res.status(400).json({ message: "Can't follow yourself" });
    }
    try {
        await Follow.findOneAndUpdate(
            { follower: req.userId, following: req.params.userId },
            {},
            { upsert: true }
        );
        res.json({ message: 'Followed' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:userId', requireAuth, async (req, res) => {
    try {
        await Follow.findOneAndDelete({ follower: req.userId, following: req.params.userId });
        res.json({ message: 'Unfollowed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
