const express = require('express');
const router = express.Router();
const List = require('../models/List');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// browse public lists from everyone
router.get('/', async (req, res) => {
    try {
        const lists = await List.find({ isPublic: true })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('user', 'username name avatar');
        res.json(lists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// the current user's own lists, public and private
router.get('/mine', requireAuth, async (req, res) => {
    try {
        const lists = await List.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(lists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// another user's public lists, for their profile page
router.get('/user/:userId', async (req, res) => {
    try {
        const lists = await List.find({ user: req.params.userId, isPublic: true }).sort({ createdAt: -1 });
        res.json(lists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const list = await List.findById(req.params.id).populate('user', 'username name avatar');
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (!list.isPublic && (!req.userId || list.user._id.toString() !== req.userId)) {
            return res.status(404).json({ message: 'List not found' });
        }
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', requireAuth, async (req, res) => {
    const { title, description, shows, isPublic } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'title is required' });
    }
    try {
        const list = await List.create({
            user: req.userId,
            title,
            description,
            shows: shows || [],
            isPublic: isPublic !== undefined ? isPublic : true,
        });
        res.status(201).json(list);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', requireAuth, async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (list.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not your list' });
        }

        const { title, description, shows, isPublic } = req.body;
        if (title !== undefined) list.title = title;
        if (description !== undefined) list.description = description;
        if (shows !== undefined) list.shows = shows;
        if (isPublic !== undefined) list.isPublic = isPublic;
        await list.save();
        res.json(list);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (list.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not your list' });
        }
        await list.deleteOne();
        res.json({ message: 'List deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
