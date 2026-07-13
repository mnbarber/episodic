const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const Review = require('../models/Review');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// recent reviews from people the current user follows
router.get('/', async (req, res) => {
    try {
        const follows = await Follow.find({ follower: req.userId }).select('following');
        const followingIds = follows.map((f) => f.following);

        const reviews = await Review.find({ user: { $in: followingIds } })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('user', 'username name avatar');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
