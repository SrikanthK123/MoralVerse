const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    username: {
        type: String,
        required: true
    },
    textContent: {
        type: String,
        required: true
    },
    textStyle: {
        fontSize: String,
        fontFamily: String,
        color: String,
        isBold: Boolean,
        isItalic: Boolean,
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
    },
    background: {
        type: {
            type: String, // 'color', 'gradient', 'image'
            default: 'color'
        },
        value: String // hex code, gradient string, or image url
    },
    imageUrl: String, // uploaded image if any
    aiModeration: {
        isSafe: Boolean,
        flaggedReason: String
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [
        {
            userId: mongoose.Schema.Types.ObjectId,
            username: String,
            text: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
