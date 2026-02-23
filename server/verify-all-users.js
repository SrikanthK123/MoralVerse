const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

async function verifyAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/MoralPostDB');
        console.log('Connected to MongoDB...');

        const result = await User.updateMany(
            { isVerified: false },
            { $set: { isVerified: true } }
        );

        console.log(`✅ Success! Updated ${result.modifiedCount} existing users to "Verified" status.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating users:', error.message);
        process.exit(1);
    }
}

verifyAll();
