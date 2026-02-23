import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import { Type, Palette, Image as ImageIcon, Download, Send, RotateCcw } from 'lucide-react';

const backgrounds = [
  { type: 'color', value: '#1e293b', name: 'Dark Slate' },
  { type: 'gradient', value: 'linear-gradient(to right, #4f46e5, #9333ea)', name: 'Indigo Purple' },
  { type: 'gradient', value: 'linear-gradient(to right, #ec4899, #8b5cf6)', name: 'Pink Violet' },
  { type: 'gradient', value: 'linear-gradient(to right, #06b6d4, #3b82f6)', name: 'Cyan Blue' },
  { type: 'gradient', value: 'linear-gradient(to right, #f59e0b, #ef4444)', name: 'Amber Red' },
];

const fonts = ['Inter', 'Roboto', 'Playfair Display', 'Montserrat', 'Lato'];

const MoralEditor = ({ onPost }) => {
  const [text, setText] = useState('Type your moral here...');
  const [style, setStyle] = useState({
    fontSize: '24px',
    fontFamily: 'Inter',
    color: '#ffffff',
    isBold: false,
    isItalic: false,
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [background, setBackground] = useState(backgrounds[0]);
  const [image, setImage] = useState(null);
  const previewRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file); // Store file for upload
        setBackground({ type: 'image', value: reader.result }); // Store dataURL for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (previewRef.current) {
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2 // Better quality
      });
      const link = document.createElement('a');
      link.download = 'moral-post.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleSubmit = () => {
    onPost({
      textContent: text,
      textStyle: { ...style, x: position.x, y: position.y },
      background: background.type === 'image' ? { type: 'image', value: '' } : background,
      imageFile: image,
    });
  };

  const getBackgroundStyle = () => {
    if (background.type === 'color') {
      return { backgroundColor: background.value };
    }
    if (background.type === 'gradient') {
      return { background: background.value };
    }
    if (background.type === 'image') {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'all 0.6s ease'
      };
    }
    return { transition: 'all 0.6s ease' };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor Controls */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Customize
          </h3>
          <button
            onClick={() => {
              setPosition({ x: 0, y: 0 });
              setText('Type your moral here...');
              setBackground(backgrounds[0]);
            }}
            className="text-xs text-slate-400 hover:text-primary flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
            <Type className="w-4 h-4" /> Message
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input-field h-32"
            placeholder="Share your wisdom..."
          />
        </div>

        {/* Typography Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Font</label>
            <select
              value={style.fontFamily}
              onChange={(e) => setStyle({ ...style, fontFamily: e.target.value })}
              className="input-field"
            >
              {fonts.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Size</label>
            <input
              type="number"
              value={parseInt(style.fontSize) || 24}
              onChange={(e) => setStyle({ ...style, fontSize: `${e.target.value}px` })}
              className="input-field"
            />
          </div>
        </div>

        {/* Style Toggles */}
        <div className="flex gap-4">
          <button
            onClick={() => setStyle({ ...style, isBold: !style.isBold })}
            className={`px-4 py-2 rounded flex-1 transition-colors ${style.isBold ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Bold
          </button>
          <button
            onClick={() => setStyle({ ...style, isItalic: !style.isItalic })}
            className={`px-4 py-2 rounded flex-1 transition-colors ${style.isItalic ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Italic
          </button>
          <input
            type="color"
            value={style.color}
            onChange={(e) => setStyle({ ...style, color: e.target.value })}
            className="h-10 w-10 rounded cursor-pointer border-0 bg-transparent p-0"
          />
        </div>

        {/* Background Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Background
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {backgrounds.map((bg, i) => (
              <button
                key={i}
                onClick={() => { setBackground(bg); setImage(null); }}
                className={`w-10 h-10 rounded-full border-2 transition-all flex-shrink-0 ${background === bg ? 'border-primary scale-110' : 'border-transparent hover:border-slate-300'}`}
                style={{ background: bg.value }}
              />
            ))}
            <label className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 hover:border-primary text-slate-400 hover:text-primary flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors">
              <span className="text-lg">+</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button onClick={handleDownload} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-medium">
            <Download className="w-5 h-5" />
            Download
          </button>
          <button onClick={handleSubmit} className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 font-medium shadow-md">
            <Send className="w-5 h-5" />
            Post
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex flex-col gap-4">
        <div className="bg-slate-100/50 rounded-2xl p-8 border border-slate-200 h-full flex items-center justify-center">
          <div
            ref={previewRef}
            className="w-full aspect-square relative flex items-center justify-center p-8 rounded-xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
            style={getBackgroundStyle()}
          >
            <div ref={containerRef} className="absolute inset-0" />

            <motion.h1
              drag
              dragConstraints={containerRef}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                setPosition(prev => ({
                  x: prev.x + info.offset.x,
                  y: prev.y + info.offset.y
                }));
              }}
              className="relative z-20 max-w-[90%] cursor-move"
              style={{
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                color: style.color,
                fontWeight: style.isBold ? 'bold' : 'normal',
                fontStyle: style.isItalic ? 'italic' : 'normal',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                textAlign: 'center',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                x: position.x,
                y: position.y
              }}
            >
              {text}
            </motion.h1>

            <div className="absolute bottom-4 right-4 opacity-50 text-xs font-mono text-white/80 z-10 pointer-events-none">
              MoralVerse
            </div>
            {(background.type === 'image' || image) && (
              <div className="absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-500" />
            )}
          </div>
        </div>
        <p className="text-center text-slate-400 text-sm">
          💡 Tip: Drag the text to position it anywhere!
        </p>
      </div>
    </div>
  );
};

export default MoralEditor;
