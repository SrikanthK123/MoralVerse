import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertCircle, Search, Filter, X, ImageIcon, Heart, MessageSquare } from 'lucide-react';
import { io } from 'socket.io-client';
import API from '../services/api';

const AdminDashboard = () => {
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState({ totalPosts: 0, totalUsers: 0, activeUsers: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPostComments, setSelectedPostComments] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [postsRes, statsRes] = await Promise.all([
                API.get('/admin/posts'),
                API.get('/admin/stats')
            ]);
            setPosts(postsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const socket = io('http://localhost:4000');

        socket.on('userUpdated', (updatedUser) => {
            setPosts(prevPosts => prevPosts.map(post => {
                if (post.userId?._id === updatedUser._id) {
                    return { ...post, userId: { ...post.userId, ...updatedUser } };
                }
                return post;
            }));
        });

        return () => socket.disconnect();
    }, []);

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await API.delete(`/admin/posts/${postId}`);
            setPosts(posts.filter(post => post._id !== postId));
            setStats(prev => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
        } catch (err) {
            alert('Failed to delete post');
            console.error(err);
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            const { data } = await API.delete(`/admin/posts/${postId}/comments/${commentId}`);
            // Update local state
            setPosts(prevPosts => prevPosts.map(post => {
                if (post._id === postId) {
                    return { ...post, comments: data.comments };
                }
                return post;
            }));
            // Update modal state if open
            if (selectedPostComments && selectedPostComments._id === postId) {
                setSelectedPostComments({ ...selectedPostComments, comments: data.comments });
            }
        } catch (err) {
            alert('Failed to delete comment');
            console.error(err);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.quote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                        Admin <span className="text-primary italic">Dashboard</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage global content and monitor community growth.</p>
                </div>

                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                    <input
                        type="text"
                        placeholder="Search posts or users..."
                        className="input-field pl-12 py-3 shadow-sm focus:shadow-md transition-shadow border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-10">
                <div className="glass-panel p-4 md:p-6 border-l-4 border-l-primary">
                    <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-widest mb-1">Total Posts</p>
                    <h3 className="text-2xl md:text-4xl font-black text-slate-800">{stats.totalPosts}</h3>
                </div>
                <div className="glass-panel p-4 md:p-6 border-l-4 border-l-emerald-500">
                    <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-widest mb-1">Users</p>
                    <h3 className="text-2xl md:text-4xl font-black text-slate-800">{stats.totalUsers}</h3>
                </div>
                <div className="glass-panel p-4 md:p-6 border-l-4 border-l-sky-500 col-span-2 md:col-span-1">
                    <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-widest mb-1">Active Members</p>
                    <h3 className="text-2xl md:text-4xl font-black text-slate-800">{stats.activeUsers}</h3>
                </div>
            </div>

            {error && (
                <div className="advanced-alert mb-8 bg-rose-50 border-rose-200">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <span className="text-rose-700 font-medium">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center flex-col items-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Synchronizing Data...</p>
                </div>
            ) : (
                <div className="space-y-10">
                    <section>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
                            <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-8 bg-primary rounded-full"></span>
                                Recent Posts
                            </h3>
                            <span className="text-[10px] md:text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-tighter w-fit">
                                Showing {filteredPosts.length} of {posts.length} Posts
                            </span>
                        </div>
                        <div className="glass-panel overflow-hidden border-slate-100 shadow-xl">
                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-left min-w-[800px] md:min-w-full">
                                    <thead className="bg-slate-900 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest">Author</th>
                                            <th className="px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest">Content Preview</th>
                                            <th className="px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest">Likes</th>
                                            <th className="px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest">Comments</th>
                                            <th className="px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {filteredPosts.map((post) => (
                                            <motion.tr
                                                key={post._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {post.userId?.avatar ? (
                                                            <img src={`http://localhost:4000${post.userId.avatar}`} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                                                                {post.userId?.username?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-800 truncate text-xs md:text-sm">{post.userId?.username || 'Unknown'}</p>
                                                            <p className="hidden md:block text-[10px] text-slate-500 truncate max-w-[120px]">{post.userId?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {post.imageUrl ? (
                                                            <div
                                                                className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden cursor-zoom-in border border-slate-200 shrink-0 group/img shadow-sm hover:shadow-md transition-all"
                                                                onClick={() => setSelectedImage(post.imageUrl)}
                                                            >
                                                                <img
                                                                    src={`http://localhost:4000${post.imageUrl}`}
                                                                    alt="Post Preview"
                                                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                                                                />
                                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                    <Search className="w-4 h-4" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                                                                <ImageIcon className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                        <p className="text-slate-600 line-clamp-2 italic font-serif text-[10px] md:text-xs max-w-[150px] md:max-w-[200px]">
                                                            "{post.quote || post.textContent}"
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full font-black text-[10px] uppercase border border-rose-100 whitespace-nowrap shadow-sm">
                                                        <Heart className="w-3 h-3 fill-rose-500" />
                                                        {post.likes?.length || 0}
                                                        <span className="hidden md:inline ml-0.5">Likes</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setSelectedPostComments(post)}
                                                        className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full font-black text-[10px] uppercase border border-slate-100 hover:bg-slate-100 transition-all whitespace-nowrap"
                                                    >
                                                        <MessageSquare className="w-3 h-3" />
                                                        {post.comments?.length || 0}
                                                        <span className="hidden md:inline ml-0.5">Comments</span>
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(post._id)}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors group"
                                                        title="Delete Post"
                                                    >
                                                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                        {filteredPosts.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">
                                                    No posts found matching your search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            )}
            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
                    onClick={() => setSelectedImage(null)}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10 max-w-full max-h-full bg-white rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={`http://localhost:4000${selectedImage}`}
                            alt="Full Preview"
                            className="max-w-full max-h-[85vh] object-contain"
                        />
                    </motion.div>
                </div>
            )}
            {/* Comments Modal */}
            {selectedPostComments && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
                    onClick={() => setSelectedPostComments(null)}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10 w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-primary" />
                                Comments Moderation
                            </h3>
                            <button
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                                onClick={() => setSelectedPostComments(null)}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-4 md:p-6 space-y-4">
                            {selectedPostComments.comments && selectedPostComments.comments.length > 0 ? (
                                selectedPostComments.comments.map((comment) => (
                                    <div key={comment._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-start gap-4">
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 text-sm mb-1">{comment.username}</p>
                                            <p className="text-slate-600 text-sm italic">"{comment.text}"</p>
                                            <p className="text-[10px] text-slate-400 mt-2">{new Date(comment.createdAt).toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteComment(selectedPostComments._id, comment._id)}
                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shrink-0"
                                            title="Delete Comment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-slate-400 italic">
                                    No comments yet on this post.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
