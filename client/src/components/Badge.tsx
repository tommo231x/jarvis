import { HTMLAttributes, ReactNode } from 'react';
import { cn } from './Button';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
}

export const Badge = ({ children, variant = 'default', className, ...props }: BadgeProps) => {
    const variants = {
        default: 'bg-jarvis-border text-jarvis-text',
        success: 'bg-jarvis-success/10 text-jarvis-success border border-jarvis-success/20',
        warning: 'bg-jarvis-warning/10 text-jarvis-warning border border-jarvis-warning/20',
        danger: 'bg-jarvis-danger/10 text-jarvis-danger border border-jarvis-danger/20',
        outline: 'border border-jarvis-border text-jarvis-muted'
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
