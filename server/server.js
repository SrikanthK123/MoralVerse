const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Middleware
app.use(express.json());
// CORS and Client URL handling
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"; // Default for local dev

const isProduction = process.env.NODE_ENV === 'production';

// Update origins to include production URL once you have it
const allowedOrigins = [
    CLIENT_URL,
    "http://localhost:3000",
    "http://localhost:5173",
    "https://moralverse.onrender.com",
    "https://moral-verse.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow all origins in production for now to fix deployment issues
        if (isProduction || !origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            callback(null, new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Serve Frontend in Production
if (isProduction) {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
        }
    });
}

// Socket Placeholder
let io;

// Make io accessible to our routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

const server = app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`🚀 Server running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
    console.log(`🌐 Port: ${PORT}`);
    console.log('-------------------------------------------');
});

// Initialize Socket.io
io = require('socket.io')(server, {
    cors: {
        origin: true, // Allow all origins for easier debugging
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'] // Ensure both are tried
});

io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', socket.id, 'Reason:', reason);
    });

    socket.on('error', (error) => {
        console.error('⚠️ Socket error:', error);
    });
});
