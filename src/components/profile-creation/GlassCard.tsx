import React from 'react';
import { motion, MotionProps } from 'framer-motion';

const springConfig = {
    type: "spring" as const,
    mass: 1,
    stiffness: 80,
    damping: 20,
};

interface GlassCardProps extends MotionProps {
    children: React.ReactNode;
    className?: string;
    elevated?: boolean;
    interactive?: boolean;
    header?: {
        icon?: any;
        title: string;
        subtitle?: string;
        action?: React.ReactNode;
    };
    onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    elevated = false,
    interactive = false,
    header,
    onClick,
    ...motionProps
}) => {
    return (
        <motion.div
            className={`
        relative rounded-3xl overflow-hidden
        ${elevated ? 'glass-panel-elevated' : 'glass-panel'}
        ${interactive ? 'cursor-pointer hover:border-black/10 hover:bg-white/80' : ''}
        ${className}
      `}
            onClick={onClick}
            initial={{ opacity: 0, y: 20, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={springConfig}
            whileHover={interactive ? {
                y: -2,
                transition: { ...springConfig, stiffness: 200 }
            } : undefined}
            whileTap={interactive ? { scale: 0.99 } : undefined}
            {...motionProps}
        >
            <div className="relative z-10 p-6 md:p-8">
                {header && (
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {header.icon && (
                                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-black/5">
                                    <header.icon className="w-5 h-5 text-foreground" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-base font-bold text-foreground tracking-tight">
                                    {header.title}
                                </h3>
                                {header.subtitle && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {header.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        {header.action && (
                            <div className="flex-shrink-0">
                                {header.action}
                            </div>
                        )}
                    </div>
                )}
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
