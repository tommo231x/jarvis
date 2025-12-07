import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    icon?: ReactNode;
    children?: ReactNode;
}

export const Button = ({
    variant = 'primary',
    size = 'md',
    className,
    icon,
    children,
    ...props
}: ButtonProps) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-jarvis-accent/50 disabled:opacity-50 disabled:pointer-events-none gap-2';

    const variants = {
        primary: 'bg-jarvis-accent text-white hover:bg-blue-600',
        secondary: 'bg-jarvis-border text-jarvis-text hover:bg-jarvis-border/80',
        outline: 'border border-jarvis-border bg-transparent text-jarvis-text hover:bg-jarvis-border/30 hover:text-white',
        ghost: 'bg-transparent text-jarvis-muted hover:text-jarvis-text hover:bg-jarvis-border/30',
        danger: 'bg-jarvis-danger text-white hover:bg-red-600'
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9 p-0'
    };

    return (
        <button
            className={cn(baseStyles, variants[variant as keyof typeof variants], sizes[size as keyof typeof sizes], className)}
            {...props}
        >
            {icon && <span className={children ? "" : "flex items-center justify-center"}>{icon}</span>}
            {children}
        </button>
    );
};

