const mongoose = require('mongoose');
const Post = require('../models/Post');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    console.log('--- Create Post Request ---');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { textContent, textStyle, background } = req.body;

    // Check moderation result from middleware
    if (req.moderationResult && req.moderationResult.isMoralPositive === false) {
      return res.status(400).json({
        message: "Content flagged by AI moderation",
        reason: req.moderationResult.reason
      });
    }

    const newPost = new Post({
      userId: req.user._id,
      username: req.user.username,
      textContent,
      textStyle,
      background,
      imageUrl: req.file ? req.file.path : null,
      aiModeration: req.moderationResult || { isMoralPositive: true, reason: '' }
    });

    console.log('Saving Post with Cloudinary URL:', newPost.imageUrl);

    const savedPost = await newPost.save();

    // Emit real-time event
    if (req.io) {
      console.log('📢 Emitting postCreated event');
      req.io.emit('postCreated', savedPost);
    } else {
      console.warn('⚠️ req.io not found in createPost');
    }

    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection issue. Please try again later.' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection issue. Please try again later.' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error(error);
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection issue. Please try again later.' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Like a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      // Check if already liked
      if (post.likes.includes(req.user._id)) {
        post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      } else {
        post.likes.push(req.user._id);
      }

      await post.save();

      // Emit real-time event
      if (req.io) {
        console.log('📢 Emitting likeUpdated event for post:', post._id);
        req.io.emit('likeUpdated', {
          postId: post._id,
          likes: post.likes
        });
      } else {
        console.warn('⚠️ req.io not found in likePost');
      }

      res.json(post.likes);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error(error);
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection issue. Please try again later.' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
// @access  Private
const commentOnPost = async (req, res) => {
  const { text } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      const comment = {
        userId: req.user._id,
        username: req.user.username,
        text,
      };

      post.comments.push(comment);
      await post.save();

      // Emit real-time event
      if (req.io) {
        console.log('📢 Emitting commentAdded event for post:', post._id);
        req.io.emit('commentAdded', {
          postId: post._id,
          comment: post.comments[post.comments.length - 1]
        });
      } else {
        console.warn('⚠️ req.io not found in commentOnPost');
      }

      res.status(201).json(post.comments);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check user
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error(error);
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection issue. Please try again later.' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  likePost,
  commentOnPost,
  deletePost
};
