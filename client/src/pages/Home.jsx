import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import API from '../services/api';
import PostCard from '../components/PostCard';
import socket from '../services/socket';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data } = await API.get('/posts');
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();

        // Socket listeners - Robust Refetching Logic
        socket.on('postCreated', () => {
            console.log('🔄 New post detected, refetching...');
            fetchPosts();
        });

        socket.on('likeUpdated', () => {
            console.log('🔄 Like update detected, refetching...');
            fetchPosts();
        });

        socket.on('commentAdded', () => {
            console.log('🔄 New comment detected, refetching...');
            fetchPosts();
        });

        return () => {
            socket.off('postCreated');
            socket.off('likeUpdated');
            socket.off('commentAdded');
        };
    }, []);

    const handleDelete = (postId) => {
        setPosts(posts.filter(post => post._id !== postId));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const title = "MoralVerse";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
            },
        },
    };

    return (
        <div>
            <div className="text-center mb-12">
                <motion.h1
                    className="text-4xl md:text-6xl font-black text-[#407088] mb-4 drop-shadow-sm flex justify-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {title.split("").map((char, index) => (
                        <motion.span key={index} variants={letterVariants}>
                            {char}
                        </motion.span>
                    ))}
                </motion.h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    Share your wisdom, inspire the world. AI-moderated for a safer, more positive community.
                </p>
            </div>

            {posts.length === 0 ? (
                <div className="text-center text-slate-500 mt-20">
                    <p className="text-xl">Be the first to share a moral!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                    {posts.map((post) => (
                        <PostCard key={post._id} post={post} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
