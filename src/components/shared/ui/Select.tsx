import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', label, options, ...props }, ref) => {
        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block px-0.5">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    <select
                        ref={ref}
                        className={`
                            block w-full px-3 py-2.5 bg-background border border-border rounded-md 
                            text-sm font-medium text-foreground transition-all cursor-pointer 
                            focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 
                            appearance-none bg-no-repeat
                            ${className}
                        `}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60 group-hover:text-foreground/80 transition-colors">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
