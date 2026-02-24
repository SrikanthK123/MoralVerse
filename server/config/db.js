const mongoose = require('mongoose');

// Store the last connection error to report in health check
let lastConnectionError = null;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        lastConnectionError = null; // Clear error on success
    } catch (error) {
        lastConnectionError = error.message;
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        if (process.env.NODE_ENV !== 'production') {
            console.error(error.stack);
        }
        // Don't exit in production so health check can still tell us it's down
    }
};

const getConnectionError = () => lastConnectionError;

module.exports = { connectDB, getConnectionError };
