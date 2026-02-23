import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    return (
        <nav className="sticky top-0 z-50 glass-panel border-t-0 border-x-0 rounded-none mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
                            <Shield className="w-8 h-8 text-primary" />
                            MoralVerse
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link to="/" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Feed
                            </Link>
                            {user ? (
                                <>
                                    <Link to="/create" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Create
                                    </Link>
                                    <Link to="/profile" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Profile
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="text-slate-800 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border-2 border-slate-800 italic mr-2 font-mono">
                                            Admin
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} className="ml-4 bg-red-50 text-red-500 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-red-200">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-[#155263] hover:text-[#103e4b] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Login
                                    </Link>
                                    <Link to="/signup" className="ml-4 btn-primary px-3 py-2 rounded-md text-sm font-medium">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-600 hover:text-slate-900 p-2 rounded-md focus:outline-none"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl overflow-hidden shadow-lg"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link
                                to="/"
                                className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Feed
                            </Link>
                            {user ? (
                                <>
                                    <Link
                                        to="/create"
                                        className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium"
                                    >
                                        Create
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-md text-base font-medium"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
