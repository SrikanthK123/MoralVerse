import { useRef, useEffect, useState } from 'react';
import { X, Send, User, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommentModal = ({ isOpen, onClose, comments, postAuthorId, onAddComment, currentUser }) => {
    const [text, setText] = useState('');
    const commentsEndRef = useRef(null);

    // Scroll to bottom when comments change
    useEffect(() => {
        if (commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onAddComment(text);
            setText('');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden relative z-10 shadow-2xl flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-800">Comments ({comments.length})</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {comments.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                <p>No comments yet. Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            comments.map((comment, index) => {
                                const isAuthor = comment.userId === postAuthorId;
                                const isAdmin = comment.userRole === 'admin' || comment.username === 'Administrator';

                                return (
                                    <div key={index} className={`flex gap-3 ${isAuthor ? 'bg-primary/5 p-2 rounded-lg border border-primary/20' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isAdmin
                                                ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-900 shadow-[0_0_10px_rgba(251,191,36,0.5)] ring-2 ring-amber-200'
                                                : isAuthor ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                            {isAdmin ? (
                                                <motion.div
                                                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                                >
                                                    <Award className="w-4 h-4" />
                                                </motion.div>
                                            ) : isAuthor ? (
                                                <Award className="w-4 h-4" />
                                            ) : (
                                                <User className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold text-sm ${isAdmin ? 'text-amber-600' : isAuthor ? 'text-primary' : 'text-slate-700'}`}>
                                                    {comment.username}
                                                </span>
                                                {isAdmin && (
                                                    <span className="text-[10px] bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm">
                                                        Admin
                                                    </span>
                                                )}
                                                {isAuthor && !isAdmin && (
                                                    <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-medium">
                                                        Author
                                                    </span>
                                                )}
                                                <span className="text-slate-400 text-xs">
                                                    {comment.createdAt && new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 text-sm mt-0.5">{comment.text}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={commentsEndRef} />
                    </div>

                    {/* Input Area */}
                    {currentUser ? (
                        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-slate-50">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!text.trim()}
                                    className="bg-primary hover:bg-secondary text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                            <p className="text-sm text-slate-500">Please <a href="/login" className="text-primary hover:underline">login</a> to comment.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CommentModal;
