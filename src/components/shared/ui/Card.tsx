import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: 'default' | 'muted' | 'accent' | 'outline' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'default', padding = 'md', children, ...props }, ref) => {
        
        const variants = {
            default: 'bg-background border-border shadow-sm',
            muted: 'bg-muted/30 border-border',
            accent: 'bg-foreground/5 border-foreground/10',
            outline: 'bg-transparent border-border hover:border-foreground/20',
            glass: 'bg-background/80 backdrop-blur-md border-border shadow-md'
        };

        const paddings = {
            none: 'p-0',
            sm: 'p-3',
            md: 'p-6',
            lg: 'p-8'
        };

        return (
            <motion.div
                ref={ref}
                className={`
                    border rounded-xl transition-all
                    ${variants[variant]}
                    ${paddings[padding]}
                    ${className}
                `}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = 'Card';

export default Card;
