const express = require('express');
const router = express.Router();
const {
    createPost,
    getPosts,
    getPostById,
    likePost,
    commentOnPost,
    deletePost
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { moderateContent } = require('../middleware/moderation');
const upload = require('../middleware/upload');

router.route('/')
    .post(protect, upload.single('image'), moderateContent, createPost)
    .get(getPosts);

router.route('/:id')
    .get(getPostById);

router.route('/:id/like')
    .put(protect, likePost);

router.route('/:id/comment')
    .post(protect, commentOnPost);

router.route('/:id')
    .get(getPostById)
    .delete(protect, deletePost);

module.exports = router;
