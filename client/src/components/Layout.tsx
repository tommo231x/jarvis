import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Box,
    Layers,
    Mail,
    Command,
    Search,
    Settings,
    Bell
} from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/' },
        { icon: Box, label: 'Services', path: '/services' },
        { icon: Layers, label: 'Projects', path: '/projects' },
        { icon: Mail, label: 'Emails', path: '/emails' },
    ];

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-jarvis-bg text-jarvis-text font-sans selection:bg-jarvis-accent/30 selection:text-white overflow-x-hidden">
            {/* Ambient Background Gradient - Cinematic Feel */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-jarvis-accent/5 blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-jarvis-secondary/5 blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10 flex h-screen overflow-hidden">
                {/* Minimal Sidebar / Dock */}
                <aside className="w-20 hidden md:flex flex-col items-center py-6 border-r border-jarvis-border bg-jarvis-bg/50 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-jarvis-accent to-jarvis-secondary flex items-center justify-center text-white shadow-lg shadow-jarvis-accent/20 mb-8">
                        <Command className="w-6 h-6" />
                    </div>

                    <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200
                                    ${isActive(item.path)
                                        ? 'bg-jarvis-accent/10 text-jarvis-accent border border-jarvis-accent/20'
                                        : 'text-jarvis-muted hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <item.icon className={`w-6 h-6 mb-1 ${isActive(item.path) ? 'text-glow' : ''}`} />
                                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute left-16 bg-jarvis-card px-2 py-1 rounded border border-jarvis-border pointer-events-none">
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </nav>

                    <div className="flex flex-col gap-4 mt-auto">
                        <button className="p-3 text-jarvis-muted hover:text-white transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 ring-2 ring-jarvis-border" />
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {/* Top Bar for Mobile/Search */}
                    <header className="h-16 border-b border-jarvis-border/50 bg-jarvis-bg/30 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
                        <div className="md:hidden flex items-center gap-2 text-white font-bold">
                            <Command className="w-5 h-5 text-jarvis-accent" />
                            <span>Jarvis</span>
                        </div>

                        {/* Global Search */}
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-jarvis-card/50 border border-jarvis-border rounded-lg w-96 group focus-within:border-jarvis-accent/50 transition-colors">
                            <Search className="w-4 h-4 text-jarvis-muted group-focus-within:text-jarvis-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="Search everything... (⌘K)"
                                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-jarvis-muted flex-1"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono text-jarvis-muted bg-white/5 px-1.5 py-0.5 rounded border border-white/10">⌘</span>
                                <span className="text-[10px] font-mono text-jarvis-muted bg-white/5 px-1.5 py-0.5 rounded border border-white/10">K</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative text-jarvis-muted hover:text-white transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-jarvis-danger border border-jarvis-bg" />
                            </button>
                        </div>
                    </header>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-jarvis-border scrollbar-track-transparent">
                        <div className="max-w-7xl mx-auto w-full pb-20">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
