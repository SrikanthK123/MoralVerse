const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// @desc    Get all posts
// @route   GET /api/admin/posts
// @access  Private/Admin
router.get('/posts', protect, admin, async (req, res) => {
    try {
        const posts = await Post.find().populate('userId', 'username email avatar').sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error(error);
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database connection issue. Please try again later.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete any post
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
router.delete('/posts/:id', protect, admin, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post) {
            await post.deleteOne();
            res.json({ message: 'Post removed by admin' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        console.error(error);
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database connection issue. Please try again later.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalPosts = await Post.countDocuments();
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isVerified: true });

        res.json({
            totalPosts,
            totalUsers,
            activeUsers
        });
    } catch (error) {
        console.error(error);
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database connection issue. Please try again later.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete a specific comment from a post
// @route   DELETE /api/admin/posts/:postId/comments/:commentId
// @access  Private/Admin
router.delete('/posts/:postId/comments/:commentId', protect, admin, async (req, res) => {
    try {
        // Atomically remove the comment using $pull
        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $pull: { comments: { _id: req.params.commentId } } },
            { new: true } // Return the updated document
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({ message: 'Comment removed by admin', comments: post.comments });
    } catch (error) {
        console.error(error);
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database connection issue. Please try again later.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
