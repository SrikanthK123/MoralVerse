const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGO_URI;

async function safeCleanup() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB via native driver...');
        const db = client.db();
        const postsCollection = db.collection('posts');

        // Find all posts
        const posts = await postsCollection.find({}).toArray();
        console.log(`Found ${posts.length} total posts.`);

        let deletedCount = 0;
        for (const post of posts) {
            // Check if userId is a valid ObjectId hex string (24 chars)
            // or if it's the old forbidden strings
            const userIdStr = String(post.userId);

            if (userIdStr === 'admin_id' || !/^[0-9a-fA-F]{24}$/.test(userIdStr)) {
                console.log(`Deleting post with invalid userId format: "${userIdStr}" (ID: ${post._id})`);
                await postsCollection.deleteOne({ _id: post._id });
                deletedCount++;
            }
        }

        console.log(`Cleanup complete! Deleted ${deletedCount} invalid posts.`);
    } catch (err) {
        console.error('Safe cleanup failed:', err);
    } finally {
        await client.close();
        process.exit(0);
    }
}

safeCleanup();
