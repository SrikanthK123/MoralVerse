const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./models/Post');

dotenv.config();

const cleanDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for cleanup...');

        // Find posts with invalid userId format (not 24 chars) or matching old "admin_id"
        const posts = await Post.find({});
        let cleanedCount = 0;

        for (const post of posts) {
            const userIdStr = post.userId.toString();
            // If it's the old 'admin_id' or not a valid 24-char hex string
            if (userIdStr === 'admin_id' || !/^[0-9a-fA-F]{24}$/.test(userIdStr)) {
                console.log(`Deleting post with invalid userId: ${userIdStr} (ID: ${post._id})`);
                await Post.findByIdAndDelete(post._id);
                cleanedCount++;
            }
        }

        console.log(`Cleanup complete! Deleted ${cleanedCount} invalid posts.`);
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanDatabase();
