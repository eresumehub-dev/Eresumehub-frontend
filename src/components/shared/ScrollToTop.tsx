import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    onClick={scrollToTop}
                    className="fixed bottom-10 right-8 z-[60] p-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full shadow-2xl shadow-[#0A2A6B]/20 text-[#0A2A6B] hover:shadow-[#4DCFFF]/40 hover:scale-110 active:scale-95 transition-all group"
                >
                    <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                    
                    {/* Ring decoration */}
                    <div className="absolute inset-0 rounded-full border-2 border-[#4DCFFF]/20 animate-ping opacity-0 group-hover:opacity-100" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;
