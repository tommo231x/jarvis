import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    icon?: LucideIcon;
    hover?: boolean;
    action?: ReactNode;
}

export const Card = ({ children, className = '', title, icon: Icon, hover, action }: CardProps) => {
    return (
        <div
            className={`
                glass-panel p-5 rounded-xl transition-all duration-300 relative group
                ${hover ? 'hover:scale-[1.01] hover:bg-jarvis-card/80 cursor-pointer' : ''}
                ${className}
            `}
        >
            {/* Spotlight Effect helper (visual only) */}
            <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 spotlight-gradient" />

            {(title || Icon) && (
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className="p-2 rounded-lg bg-white/5 text-jarvis-muted group-hover:text-jarvis-accent group-hover:bg-jarvis-accent/10 transition-colors">
                                <Icon className="w-5 h-5" />
                            </div>
                        )}
                        {title && (
                            <h3 className="text-sm font-semibold text-jarvis-text group-hover:text-white transition-colors">
                                {title}
                            </h3>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
