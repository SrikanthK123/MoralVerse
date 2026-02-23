import { motion } from 'framer-motion';

const PosterPreview = ({ post, scale = 1, showOverlay = true }) => {
    const getBackgroundStyle = () => {
        const { background, imageUrl } = post;
        if (imageUrl) {
            return {
                backgroundImage: `url("http://localhost:4000${imageUrl}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'all 0.6s ease'
            };
        }
        if (background) {
            if (background.type === 'color') return { backgroundColor: background.value };
            if (background.type === 'gradient') return { background: background.value };
            if (background.type === 'image') return { backgroundImage: `url(${background.value})`, transition: 'all 0.6s ease' };
        }
        return { backgroundColor: '#1e293b', transition: 'all 0.6s ease' };
    };

    return (
        <div
            className="aspect-square w-full flex items-center justify-center p-8 relative overflow-hidden h-full"
            style={getBackgroundStyle()}
        >
            <motion.h2
                className="relative z-20 max-w-[90%] max-h-[85%] overflow-y-auto custom-scrollbar-hide"
                style={{
                    fontFamily: post.textStyle?.fontFamily || 'Inter',
                    fontSize: post.textStyle?.fontSize
                        ? `clamp(14px, calc(${post.textStyle.fontSize} * ${scale} * 0.8), calc(${post.textStyle.fontSize} * ${scale}))`
                        : 'clamp(16px, 4vw, 24px)',
                    color: post.textStyle?.color || '#ffffff',
                    fontWeight: post.textStyle?.isBold ? 'bold' : 'normal',
                    fontStyle: post.textStyle?.isItalic ? 'italic' : 'normal',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {post.textContent}
            </motion.h2>

            <div className="absolute bottom-4 right-4 opacity-70 text-xs font-mono text-white/80 bg-black/20 px-2 py-1 rounded z-20 backdrop-blur-sm">
                @{post.username}
            </div>

            {showOverlay && (post.imageUrl || (post.background && post.background.type === 'image')) && (
                <div className="absolute inset-0 bg-black/40 transition-opacity duration-500" />
            )}
        </div>
    );
};

export default PosterPreview;
