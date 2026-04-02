import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
    rightElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, hint, rightElement, ...props }, ref) => {
        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <div className="flex items-center justify-between px-0.5">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-auto">
                            {label}
                        </label>
                        {hint && <span className="text-[10px] text-muted-foreground/60 ml-2">{hint}</span>}
                    </div>
                )}
                <div className="relative group">
                    <input
                        ref={ref}
                        className={`
                            block w-full px-3 py-2.5 bg-background border border-border rounded-md 
                            text-sm font-medium text-foreground placeholder:text-muted-foreground/50 
                            focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 
                            transition-all md:hover:border-foreground/30
                            ${className}
                        `}
                        {...props}
                    />
                    {rightElement && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                            {rightElement}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
