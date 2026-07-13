const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { requireAuth } = require('../middleware/auth');

// public: another user's reviews, for their profile page / the feed
router.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.params.userId })
            .sort({ createdAt: -1 })
            .populate('user', 'username name avatar');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.use(requireAuth);

// current user's reviews for every season of a show
router.get('/:tmdbId', async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.userId, tmdbId: req.params.tmdbId }).sort({ season: 1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:tmdbId/:season', async (req, res) => {
    const { text, rating, seasonName, showTitle, posterPath } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'text is required' });
    }
    if (!showTitle) {
        return res.status(400).json({ message: 'showTitle is required' });
    }

    try {
        const review = await Review.findOneAndUpdate(
            { user: req.userId, tmdbId: req.params.tmdbId, season: req.params.season },
            { text, rating, seasonName, showTitle, posterPath },
            { upsert: true, new: true, runValidators: true }
        );
        res.json(review);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:tmdbId/:season', async (req, res) => {
    try {
        await Review.findOneAndDelete({ user: req.userId, tmdbId: req.params.tmdbId, season: req.params.season });
        res.json({ message: 'Removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
