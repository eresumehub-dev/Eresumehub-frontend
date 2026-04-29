import React from 'react';
import { motion } from 'framer-motion';

const MagneticButton: React.FC<any> = ({ children, onClick, variant = 'primary', className = '', disabled }) => {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
         relative overflow-hidden px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2
         ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
         ${variant === 'primary'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10'
                    : 'bg-white text-foreground border border-black/10 hover:bg-gray-50'}
         ${className}
       `}
        >
            <span className="relative z-10 flex items-center gap-2">{children}</span>
            {variant === 'primary' && !disabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-15deg] translate-x-[-100%] hover:animate-shimmer" />
            )}
        </motion.button>
    )
}

export default MagneticButton;
