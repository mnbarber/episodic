const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    name: {
        type: String,
    },
    avatar: {
        type: String,
    },
    bio: {
        type: String,
        maxlength: 500,
        default: '',
    },
    topShows: {
        type: [{
            tmdbId: { type: Number, required: true },
            title: { type: String, required: true },
            posterPath: { type: String },
            _id: false,
        }],
        validate: {
            validator: (arr) => arr.length <= 5,
            message: 'You can only pick up to 5 top shows',
        },
        default: [],
    },
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;