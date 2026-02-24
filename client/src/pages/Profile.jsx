import { useEffect, useState, useContext } from 'react';
import API, { BASE_URL, ABSOLUTE_BACKEND_URL } from '../services/api';
import PostCard from '../components/PostCard';
import AuthContext from '../context/AuthContext';
import { Camera, Mail, LayoutGrid } from 'lucide-react';

const Profile = () => {
    const { user, updateUserAvatar } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data } = await API.get('/posts');
                const userPosts = data.filter(post => post.userId === user?._id || post.username === user?.username);
                setPosts(userPosts);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPosts();
        }
    }, [user]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        try {
            const { data } = await API.put('/auth/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            updateUserAvatar(data.avatar);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (postId) => {
        setPosts(posts.filter(post => post._id !== postId));
    };

    if (loading) return <div className="text-primary text-center mt-20">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="glass-panel p-8 mb-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                <div className="relative group flex-shrink-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl font-bold text-primary transition-transform duration-300 group-hover:scale-[1.02]">
                        {user?.avatar ? (
                            <img
                                src={`${BASE_URL}${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`}
                                alt={user.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user?.username?.[0]?.toUpperCase()
                        )}

                        {uploading && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-primary-dark">
                        <Camera size={20} />
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleAvatarChange}
                            accept="image/*"
                            disabled={uploading}
                        />
                    </label>
                </div>

                <div className="flex-1 z-10">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">{user?.username}</h1>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mt-3">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Mail size={16} />
                            <span>{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary font-semibold bg-primary/10 px-4 py-1 rounded-full text-sm self-start">
                            <LayoutGrid size={16} />
                            <span>{posts.length} Moral Posts</span>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">My Moral Posts</h2>

            {posts.length === 0 ? (
                <div className="text-center text-slate-500 py-10">
                    <p>You haven't posted anything yet.</p>
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

export default Profile;
