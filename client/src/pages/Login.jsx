import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminSecretKey, setAdminSecretKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            return setError('Please fill in all fields');
        }

        setError('');
        setLoading(true);
        try {
            await login(email, password, adminSecretKey);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 w-full max-w-md"
            >
                <h2 className="text-3xl font-black text-center mb-6 text-slate-800">
                    Welcome Back
                </h2>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="advanced-alert mb-6"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="font-medium text-sm">{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="input-field pl-12"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-baseline mb-2 ml-1">
                            <label className="block text-sm font-bold text-slate-700">Password</label>
                            <Link to="/forgot-password" theme-link className="text-xs font-semibold text-primary hover:text-secondary transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="input-field pl-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {email === 'srikanthkondapaka2010@gmail.com' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="overflow-hidden"
                        >
                            <label className="block text-sm font-bold text-rose-600 mb-2 ml-1">Admin Secret Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400 group-focus-within:text-rose-500 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Enter secret key"
                                    className="input-field pl-12 border-rose-200 focus:ring-rose-500"
                                    value={adminSecretKey}
                                    onChange={(e) => setAdminSecretKey(e.target.value)}
                                />
                            </div>
                        </motion.div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full btn-primary mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="mt-8 text-center text-slate-500 text-sm">
                    Don't have an account? <Link to="/signup" className="text-primary hover:text-secondary font-bold">Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
