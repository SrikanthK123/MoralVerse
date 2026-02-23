import { Link } from 'react-router-dom';
import { useState, useRef, useContext, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Download, Share2, Trash2 } from 'lucide-react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import CommentModal from './CommentModal';
import ConfirmationModal from './ConfirmationModal';
import PosterPreview from './PosterPreview';
import PostModal from './PostModal';
import socket from '../services/socket';

const PostCard = ({ post, onDelete }) => {
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments || []);

  useEffect(() => {
    setLikes(post.likes);
    setComments(post.comments || []);
  }, [post.likes, post.comments]);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const cardRef = useRef(null);

  const handleCommentSubmit = async (text) => {
    try {
      const { data } = await API.post(`/posts/${post._id}/comment`, { text });
      setComments(data);
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await API.put(`/posts/${post._id}/like`);
      setLikes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2
      });
      const link = document.createElement('a');
      link.download = `moral-post-${post._id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel overflow-hidden group hover:border-primary/30 transition-all duration-300"
      >
        {/* Clickable Poster Content */}
        <div
          ref={cardRef}
          onClick={() => setIsPostModalOpen(true)}
          className="cursor-pointer group/poster"
        >
          <PosterPreview post={post} />
        </div>

        {/* Actions Bar */}
        <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white/50 backdrop-blur-md min-h-[64px]">
          {user ? (
            <>
              <div className="flex space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 transition-colors group/like ${user && likes.includes(user._id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                >
                  <div className={`p-2 rounded-full transition-colors group-hover/like:bg-rose-50 ${user && likes.includes(user._id) ? 'text-rose-500' : ''}`}>
                    <Heart className={`w-6 h-6 ${user && likes.includes(user._id) ? 'fill-current' : ''}`} />
                  </div>
                  {likes.length > 10 && (
                    <span className="font-medium text-sm">{likes.length}</span>
                  )}
                </button>

                <button
                  onClick={() => setIsCommentModalOpen(true)}
                  className="flex items-center space-x-2 text-slate-400 hover:text-primary transition-colors group/comment"
                >
                  <div className="p-2 rounded-full group-hover/comment:bg-primary/10 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-sm">{comments.length}</span>
                </button>
              </div>

              <div className="flex space-x-2">
                {user._id === post.userId && (
                  <button
                    onClick={handleDelete}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Delete Post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full text-center">
              <Link to="/login" className="text-sm font-medium text-primary hover:text-secondary transition-colors underline-offset-4 hover:underline">
                Login to access or interact with poster
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        comments={comments}
        postAuthorId={post.userId}
        onAddComment={handleCommentSubmit}
        currentUser={user}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
      />

      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        post={post}
      />
    </>
  );
};

export default PostCard;
