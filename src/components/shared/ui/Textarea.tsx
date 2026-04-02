import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = '', label, hint, rows = 8, ...props }, ref) => {
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
                <textarea
                    ref={ref}
                    rows={rows}
                    className={`
                        block w-full px-3 py-2.5 bg-background border border-border rounded-md 
                        text-sm font-normal text-foreground placeholder:text-muted-foreground/50 
                        focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 
                        transition-all resize-none leading-relaxed md:hover:border-foreground/30
                        ${className}
                    `}
                    {...props}
                />
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
