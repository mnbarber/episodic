const express = require('express');
const router = express.Router();
const { tmdbFetch } = require('../services/tmdb');

router.get('/trending', async (req, res) => {
    try {
        const data = await tmdbFetch('/trending/tv/week');
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});

router.get('/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Missing query param' });
    }
    try {
        const data = await tmdbFetch('/search/tv', { query });
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});

router.get('/tv/:id', async (req, res) => {
    try {
        const data = await tmdbFetch(`/tv/${req.params.id}`, {
            append_to_response: 'credits',
        });
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});

router.get('/tv/:id/season/:seasonNumber', async (req, res) => {
    try {
        const data = await tmdbFetch(`/tv/${req.params.id}/season/${req.params.seasonNumber}`);
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});

router.get('/genres/tv', async (req, res) => {
    try {
        const data = await tmdbFetch('/genre/tv/list');
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});

// highest-rated shows matching a genre, keyword, and/or origin country, with a
// minimum vote count so a handful of 10/10 votes doesn't outrank a show with
// thousands of ratings
router.get('/discover', async (req, res) => {
    const { genre, keyword, origin_country, without_genres, minVotes } = req.query;
    if (!genre && !keyword && !origin_country) {
        return res.status(400).json({ message: 'Provide at least one of: genre, keyword, origin_country' });
    }
    try {
        const params = {
            sort_by: 'vote_average.desc',
            'vote_count.gte': minVotes || 200,
        };
        if (genre) params.with_genres = genre;
        if (keyword) params.with_keywords = keyword;
        if (origin_country) params.with_origin_country = origin_country;
        if (without_genres) params.without_genres = without_genres;

        const data = await tmdbFetch('/discover/tv', params);
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});

module.exports = router;
