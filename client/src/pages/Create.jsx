import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import MoralEditor from '../components/MoralEditor';
import AILoading from '../components/AILoading';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const Create = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePost = async ({ textContent, textStyle, background, imageFile }) => {
        setLoading(true);
        setError('');

        const animationTimer = new Promise(resolve => setTimeout(resolve, 6000));

        try {
            const formData = new FormData();
            formData.append('textContent', textContent);
            formData.append('textStyle[fontSize]', textStyle.fontSize);
            formData.append('textStyle[fontFamily]', textStyle.fontFamily);
            formData.append('textStyle[color]', textStyle.color);
            formData.append('textStyle[isBold]', textStyle.isBold);
            formData.append('textStyle[isItalic]', textStyle.isItalic);

            formData.append('background[type]', background.type);
            formData.append('background[value]', background.value || '');

            if (imageFile) {
                formData.append('image', imageFile);
            }

            // Run API call and 6s timer in parallel
            const [apiResponse] = await Promise.all([
                API.post('/posts', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }),
                animationTimer
            ]);

            navigate('/');
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || err.response?.data?.reason || 'Failed to create post. Moderation might have rejected it.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-slate-800">
                Create a Moral Post
            </h1>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-start">
                    <span className="mr-2">⚠️</span>
                    <div>
                        <p className="font-bold">Message Rejected</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}
            {loading ? (
                <AILoading />
            ) : (
                <MoralEditor onPost={handlePost} />
            )}
        </div>
    );
};

export default Create;
