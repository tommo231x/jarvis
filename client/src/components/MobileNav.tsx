import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Shield, 
    Mail, 
    Folder,
    Bot
} from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: Shield, label: 'Services', path: '/apps/identity/services' },
    { icon: Mail, label: 'Emails', path: '/apps/identity/emails' },
    { icon: Folder, label: 'Projects', path: '/apps/identity/projects' },
    { icon: Bot, label: 'AI', path: '/apps/identity/ai' },
];

export const MobileNav = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9990] bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 safe-area-pb">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex flex-col items-center justify-center flex-1 h-full py-2 
                                transition-all duration-200 active:scale-95
                                ${active 
                                    ? 'text-violet-400' 
                                    : 'text-slate-400 hover:text-slate-200'
                                }
                            `}
                        >
                            <div className={`
                                relative p-1.5 rounded-xl transition-all duration-200
                                ${active ? 'bg-violet-500/20' : ''}
                            `}>
                                <item.icon className={`w-5 h-5 ${active ? 'text-violet-400' : ''}`} />
                                {active && (
                                    <div className="absolute inset-0 rounded-xl bg-violet-500/10 blur-sm" />
                                )}
                            </div>
                            <span className={`
                                text-[10px] mt-1 font-medium transition-all
                                ${active ? 'text-violet-400' : 'text-slate-500'}
                            `}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
