const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket Placeholder
let io;

// Make io accessible to our routes - MUST be before routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const server = app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Allowing Client: ${CLIENT_URL}`);
    console.log('-------------------------------------------');
});

// Initialize Socket.io after server is started
io = require('socket.io')(server, {
    cors: {
        origin: [CLIENT_URL, "http://localhost:3000", "http://localhost:5173"],
        credentials: true,
        methods: ["GET", "POST"]
    }
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
