import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles, Scan, Brain, CheckCircle2 } from 'lucide-react';

const AILoading = () => {
    const [step, setStep] = useState(0);
    const steps = [
        { text: "Scanning text...", icon: Scan },
        { text: "Analyzing sentiment...", icon: Brain },
        { text: "Checking moral alignment...", icon: Sparkles },
        { text: "Finalizing...", icon: CheckCircle2 }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1500); // 1500ms * 4 steps = 6000ms (6 seconds)
        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = steps[step].icon;

    return (
        <div className="flex flex-col items-center justify-center p-12 glass-panel min-h-[300px]">
            <div className="relative mb-8">
                {/* Outer Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary"
                />

                {/* Inner Pulse */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 m-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
                >
                    <CurrentIcon className="w-8 h-8 text-primary" />
                </motion.div>
            </div>

            <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
            >
                <h3 className="text-xl font-bold text-slate-700 mb-2">AI Moderation</h3>
                <p className="text-slate-500 min-w-[200px]">{steps[step].text}</p>
            </motion.div>

            {/* Progress Dots */}
            <div className="flex gap-2 mt-6">
                {steps.map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            scale: i === step ? 1.5 : 1,
                            backgroundColor: i === step ? '#407088' : '#e2e8f0'
                        }}
                        className="w-2 h-2 rounded-full"
                    />
                ))}
            </div>
        </div>
    );
};

export default AILoading;
