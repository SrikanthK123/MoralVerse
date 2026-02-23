import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import API from '../services/api';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await API.get(`/auth/verify/${token}`);
                setStatus('success');
                setMessage(data.message);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-12 max-w-md w-full text-center"
            >
                {status === 'verifying' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifying...</h2>
                        <p className="text-slate-500">Please wait while we confirm your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Email Verified!</h2>
                        <p className="text-slate-500 mb-8">{message}</p>
                        <Link to="/login" className="btn-primary inline-block">
                            Go to Login
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h2>
                        <p className="text-slate-500 mb-8">{message}</p>
                        <Link to="/signup" className="text-primary font-medium hover:underline">
                            Try signing up again
                        </Link>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
