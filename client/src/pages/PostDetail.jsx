import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import PostCard from '../components/PostCard';
import AuthContext from '../context/AuthContext';
import socket from '../services/socket';

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data } = await API.get(`/posts/${id}`);
                setPost(data);
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();

        // Socket listeners - Robust Refetching Logic
        socket.on('commentAdded', ({ postId }) => {
            if (postId === id) {
                console.log('🔄 New comment detected for this post, refetching...');
                fetchPost();
            }
        });

        socket.on('likeUpdated', ({ postId }) => {
            if (postId === id) {
                console.log('🔄 Like update detected for this post, refetching...');
                fetchPost();
            }
        });

        return () => {
            socket.off('commentAdded');
            socket.off('likeUpdated');
        };
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            const { data } = await API.post(`/posts/${id}/comment`, { text: comment });
            // Update local state
            setPost({ ...post, comments: data });
            setComment('');
        } catch (error) {
            console.error('Error commenting:', error);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading...</div>;
    if (!post) return <div className="text-white text-center mt-20">Post not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <PostCard post={post} />

            <div className="glass-panel p-6 mt-8">
                <h3 className="text-xl font-bold text-white mb-4">Comments ({post.comments.length})</h3>

                {user && (
                    <form onSubmit={handleCommentSubmit} className="mb-8 flex gap-4">
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="input-field flex-1"
                        />
                        <button type="submit" className="btn-primary px-6">
                            Post
                        </button>
                    </form>
                )}

                <div className="space-y-4">
                    {post.comments.map((comment, index) => (
                        <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-indigo-400">{comment.username}</span>
                                <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-300">{comment.text}</p>
                        </div>
                    ))}
                    {post.comments.length === 0 && (
                        <p className="text-gray-500 text-center">No comments yet. Be the first!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
