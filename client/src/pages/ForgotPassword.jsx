import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [devResetLink, setDevResetLink] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        if (!email) {
            return setError('Please enter your email address');
        }

        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await API.post('/auth/forgotpassword', { email });
            setMessage(data.message);
            if (data.devResetLink) {
                setDevResetLink(data.devResetLink);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 max-w-md w-full"
            >
                <Link to="/login" className="flex items-center text-sm text-slate-500 hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Link>

                <h2 className="text-3xl font-black text-slate-800 mb-2">Forgot Password?</h2>
                <p className="text-slate-500 mb-8">Enter your email and we'll send you a link to reset your password.</p>

                {message && (
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-center font-medium space-y-4">
                        <p>{message}</p>

                        {devResetLink && (
                            <div className="pt-4 border-t border-emerald-100">
                                <p className="text-sm text-slate-600 mb-3 italic">Development Mode: Use the button below to reset now</p>
                                <a
                                    href={devResetLink}
                                    className="btn-primary py-2 px-4 inline-block text-sm"
                                >
                                    Reset Password Now
                                </a>
                            </div>
                        )}

                        {!devResetLink && (
                            <p className="text-xs opacity-75 italic border-t border-emerald-100 pt-2">
                                Check the terminal running your backend server for the link.
                            </p>
                        )}
                    </div>
                )}

                {!message && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="input-field pl-12"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

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

                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
