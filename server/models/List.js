const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: '',
    },
    shows: [{
        tmdbId: { type: Number, required: true },
        title: { type: String, required: true },
        posterPath: { type: String },
        _id: false,
    }],
    isPublic: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const List = mongoose.model('List', listSchema);

module.exports = List;
