const mongoose = require('mongoose');

// Store the last connection error to report in health check
let lastConnectionError = null;

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        const isLocalhost = uri && (uri.includes('127.0.0.1') || uri.includes('localhost'));
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction && isLocalhost) {
            console.warn('⚠️ WARNING: MONGO_URI is pointing to localhost in PRODUCTION mode. This will likely fail.');
            lastConnectionError = 'MONGO_URI points to localhost in production. Please set a remote MongoDB URI in Render.';
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        lastConnectionError = null; // Clear error on success
    } catch (error) {
        // If we already set a more descriptive error for localhost, keep it
        if (!lastConnectionError || !lastConnectionError.includes('localhost')) {
            lastConnectionError = error.message;
        }
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        if (process.env.NODE_ENV !== 'production') {
            console.error(error.stack);
        }
    }
};

const getConnectionError = () => lastConnectionError;

module.exports = { connectDB, getConnectionError };
