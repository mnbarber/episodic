const express = require('express');
const router = express.Router();
const Tracking = require('../models/Tracking');
const { requireAuth } = require('../middleware/auth');

// public: another user's tracked shows, for their profile page
router.get('/user/:userId', async (req, res) => {
    try {
        const entries = await Tracking.find({ user: req.params.userId }).sort({ updatedAt: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.use(requireAuth);

// all of the current user's tracked shows
router.get('/', async (req, res) => {
    try {
        const entries = await Tracking.find({ user: req.userId }).sort({ updatedAt: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// tracking state for one show, so the show detail page can reflect it
router.get('/:tmdbId', async (req, res) => {
    try {
        const entry = await Tracking.findOne({ user: req.userId, tmdbId: req.params.tmdbId });
        res.json(entry || null);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// create or update tracking state for a show
router.put('/:tmdbId', async (req, res) => {
    const { status, rating, title, posterPath } = req.body;
    if (!status) {
        return res.status(400).json({ message: 'status is required' });
    }

    try {
        const entry = await Tracking.findOneAndUpdate(
            { user: req.userId, tmdbId: req.params.tmdbId },
            { status, rating, title, posterPath },
            { upsert: true, new: true, runValidators: true }
        );
        res.json(entry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// mark/unmark one or more episodes as watched (used for both single-episode toggles
// and "mark whole season watched" bulk actions from the frontend)
router.put('/:tmdbId/episodes', async (req, res) => {
    const { episodes, watched, title, posterPath, totalEpisodes } = req.body;
    if (!Array.isArray(episodes) || episodes.length === 0) {
        return res.status(400).json({ message: 'episodes must be a non-empty array' });
    }

    try {
        let entry = await Tracking.findOne({ user: req.userId, tmdbId: req.params.tmdbId });
        if (!entry) {
            if (!title) {
                return res.status(400).json({ message: 'title is required to start tracking a show' });
            }
            entry = new Tracking({
                user: req.userId,
                tmdbId: req.params.tmdbId,
                title,
                posterPath,
                status: 'watching',
                watchedEpisodes: [],
            });
        }

        const key = (s, e) => `${s}-${e}`;
        if (watched) {
            const existing = new Set(entry.watchedEpisodes.map((w) => key(w.season, w.episode)));
            for (const ep of episodes) {
                if (!existing.has(key(ep.season, ep.episode))) {
                    entry.watchedEpisodes.push({ season: ep.season, episode: ep.episode });
                }
            }
        } else {
            entry.watchedEpisodes = entry.watchedEpisodes.filter(
                (w) => !episodes.some((ep) => ep.season === w.season && ep.episode === w.episode)
            );
        }

        if (title) entry.title = title;
        if (posterPath) entry.posterPath = posterPath;

        // auto-advance status based on progress, unless the user has deliberately dropped the show
        if (entry.status !== 'dropped') {
            if (totalEpisodes && entry.watchedEpisodes.length >= totalEpisodes) {
                entry.status = 'completed';
            } else if (entry.watchedEpisodes.length > 0) {
                entry.status = 'watching';
            }
        }

        await entry.save();
        res.json(entry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:tmdbId', async (req, res) => {
    try {
        await Tracking.findOneAndDelete({ user: req.userId, tmdbId: req.params.tmdbId });
        res.json({ message: 'Removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
