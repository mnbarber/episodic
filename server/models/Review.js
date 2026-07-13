const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tmdbId: {
        type: Number,
        required: true,
    },
    season: {
        type: Number,
        required: true,
    },
    seasonName: {
        type: String,
    },
    showTitle: {
        type: String,
        required: true,
    },
    posterPath: {
        type: String,
    },
    rating: {
        type: Number,
        min: 0.5,
        max: 5,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

reviewSchema.index({ user: 1, tmdbId: 1, season: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
