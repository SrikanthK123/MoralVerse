const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateAvatar
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/verify/:token', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);

module.exports = router;
