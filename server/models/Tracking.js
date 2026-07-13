const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tmdbId: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    posterPath: {
        type: String,
    },
    status: {
        type: String,
        enum: ['want_to_watch', 'watching', 'completed', 'dropped'],
        required: true,
    },
    rating: {
        type: Number,
        min: 0.5,
        max: 5,
    },
    watchedEpisodes: [{
        season: { type: Number, required: true },
        episode: { type: Number, required: true },
        _id: false,
    }],
}, { timestamps: true });

trackingSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

const Tracking = mongoose.model('Tracking', trackingSchema);

module.exports = Tracking;
