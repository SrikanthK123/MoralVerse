const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id, role = 'user') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            isVerified: true // Auto-verify users for now
        });

        res.status(201).json({
            message: 'Registration successful!',
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isVerified: true,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password, adminSecretKey } = req.body;

    try {
        // 1. Check if this is an Admin login attempt
        if (email === process.env.ADMIN_EMAIL) {
            if (password === process.env.ADMIN_PASSWORD) {
                if (adminSecretKey === process.env.ADMIN_SECRET_KEY) {
                    const adminId = '000000000000000000000000'; // Special valid ObjectId format for admin
                    return res.json({
                        _id: adminId,
                        username: 'Administrator',
                        email: process.env.ADMIN_EMAIL,
                        role: 'admin',
                        isVerified: true,
                        token: generateToken(adminId, 'admin'),
                    });
                } else {
                    return res.status(401).json({ message: 'Invalid Admin Secret Key' });
                }
            } else {
                return res.status(401).json({ message: 'Invalid Admin Credentials' });
            }
        }

        // 2. Normal User Login
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isVerified: user.isVerified,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with that email' });
        }

        // Get reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

        try {
            // Log for development
            console.log('-------------------------------------------');
            console.log('PASSWORD RESET LINK:');
            console.log(resetUrl);
            console.log('-------------------------------------------');

            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message
            });

            res.status(200).json({
                message: 'Reset link sent to email. (Dev Tip: If no email arrives, check your Server Terminal!)',
                devResetLink: resetUrl
            });
        } catch (err) {
            console.error('Email sending failed, but reset link is in console:', err.message);
            res.status(200).json({
                message: 'Password Reset Link is waiting for you below (Development Mode).',
                devResetLink: resetUrl
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user avatar
// @route   PUT /api/auth/avatar
// @access  Private
const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const user = await User.findById(req.user._id);

        if (user) {
            // Ensure path is saved consistently with forward slashes and a leading slash
            const relativePath = req.file.path.replace(/\\/g, '/');
            user.avatar = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
            await user.save();

            // Emit update for Admin Dashboard
            if (req.io) {
                req.io.emit('userUpdated', {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar
                });
            }

            res.json({
                message: 'Avatar updated successfully',
                avatar: user.avatar
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateAvatar
};
