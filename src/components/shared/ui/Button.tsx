import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: LucideIcon;
    rightIcon?: LucideIcon;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', loading, icon: Icon, rightIcon: RightIcon, children, disabled, ...props }, ref) => {
        
        const variants = {
            primary: 'bg-foreground text-background hover:bg-foreground/90 shadow-sm active:scale-[0.98]',
            secondary: 'bg-muted text-foreground hover:bg-muted/80 active:scale-[0.98]',
            outline: 'bg-transparent border border-border text-foreground hover:border-foreground/30 active:scale-[0.98]',
            ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors',
            danger: 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20'
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs rounded-md',
            md: 'px-4 py-2.5 text-sm rounded-md',
            lg: 'px-6 py-3 text-base rounded-md font-semibold'
        };

        return (
            <motion.button
                ref={ref}
                disabled={disabled || loading}
                whileHover={!(disabled || loading) ? { y: -1 } : {}}
                whileTap={!(disabled || loading) ? { scale: 0.98 } : {}}
                className={`
                    inline-flex items-center justify-center gap-2 font-medium 
                    transition-all duration-150 focus:outline-none focus:ring-2 
                    focus:ring-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed
                    ${variants[variant]}
                    ${sizes[size]}
                    ${className}
                `}
                {...(props as any)}
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
                {children}
                {!loading && RightIcon && <RightIcon className="w-4 h-4" />}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
