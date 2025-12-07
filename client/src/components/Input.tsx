import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-xs font-medium text-jarvis-muted mb-1.5 uppercase tracking-wider">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
                        w-full px-4 py-2 bg-jarvis-bg/50 border border-jarvis-border rounded-lg text-sm text-white 
                        placeholder:text-jarvis-muted/50 focus:outline-none focus:border-jarvis-accent/50 focus:ring-1 focus:ring-jarvis-accent/50 
                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                        ${error ? 'border-jarvis-danger focus:border-jarvis-danger focus:ring-jarvis-danger' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-jarvis-danger">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
