import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const springConfig = {
    type: "spring" as const,
    mass: 1,
    stiffness: 80,
    damping: 20,
};

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: any;
    error?: string;
    monospace?: boolean;
    labelAction?: React.ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
    ({ label, icon: Icon, error, monospace, labelAction, className = '', ...props }, ref) => {
        return (
            <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springConfig}
            >
                {label && (
                    <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-1">
                            {label}
                            {props.required && <span className="text-destructive">*</span>}
                        </label>
                        {labelAction}
                    </div>
                )}
                <div className="relative group">
                    {Icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 
                          group-focus-within:text-foreground transition-colors duration-300">
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full px-4 py-3.5 bg-white/50 backdrop-blur-md rounded-xl text-foreground text-sm
              placeholder:text-muted-foreground/60 transition-all duration-300 
              border border-black/5
              hover:bg-white hover:border-black/10
              focus:outline-none focus:bg-white focus:border-black/20
              focus:shadow-[0_0_0_3px_rgba(0,0,0,0.03)]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted
              ${Icon ? 'pl-11' : ''}
              ${monospace ? 'font-mono tracking-wide' : ''}
              ${error ? 'border-destructive focus:border-destructive' : ''}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-destructive font-medium pl-1">{error}</p>}
            </motion.div>
        );
    }
);
GlassInput.displayName = 'GlassInput';

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    monospace?: boolean;
    labelAction?: React.ReactNode;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
    ({ label, error, monospace, labelAction, className = '', ...props }, ref) => {
        return (
            <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springConfig}
            >
                {label && (
                    <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-1">
                            {label}
                            {props.required && <span className="text-destructive">*</span>}
                        </label>
                        {labelAction}
                    </div>
                )}
                <textarea
                    ref={ref}
                    className={`
            w-full px-4 py-3.5 bg-white/50 backdrop-blur-md rounded-xl text-foreground text-sm
            placeholder:text-muted-foreground/60 transition-all duration-300 
            border border-black/5 resize-none
            hover:bg-white hover:border-black/10
            focus:outline-none focus:bg-white focus:border-black/20
            focus:shadow-[0_0_0_3px_rgba(0,0,0,0.03)]
            ${monospace ? 'font-mono tracking-wide' : ''}
            ${className}
          `}
                    {...props}
                />
            </motion.div>
        );
    }
);
GlassTextarea.displayName = 'GlassTextarea';
