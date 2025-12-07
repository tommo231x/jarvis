import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, Mail, Box, Folder, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex bg-slate-950 min-h-screen">
            <aside className="w-16 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-10">
                <div className="p-4 flex items-center justify-center md:justify-start border-b border-slate-800 h-16">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 shrink-0">
                        <Shield size={20} className="text-blue-400" />
                    </div>
                    <span className="ml-3 font-bold text-white hidden md:block">Jarvis</span>
                </div>

                <nav className="flex-1 p-2 space-y-1">
                    <Link to="/" className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActive('/') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Home size={20} className="shrink-0" />
                        <span className="ml-3 hidden md:block">Home</span>
                    </Link>

                    <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:block">
                        Identity Hub
                    </div>

                    <Link to="/apps/identity" className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActive('/apps/identity') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Box size={20} className="shrink-0" />
                        <span className="ml-3 hidden md:block">Overview</span>
                    </Link>
                    <Link to="/apps/identity/emails" className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActive('/apps/identity/emails') ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Mail size={20} className="shrink-0" />
                        <span className="ml-3 hidden md:block">Emails</span>
                    </Link>
                    <Link to="/apps/identity/services" className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActive('/apps/identity/services') ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Shield size={20} className="shrink-0" />
                        <span className="ml-3 hidden md:block">Services</span>
                    </Link>
                    <Link to="/apps/identity/projects" className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActive('/apps/identity/projects') ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Folder size={20} className="shrink-0" />
                        <span className="ml-3 hidden md:block">Projects</span>
                    </Link>
                    <Link to="/apps/identity/ai" className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActive('/apps/identity/ai') ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Search size={20} className="shrink-0" />
                        <span className="ml-3 hidden md:block">AI Search</span>
                    </Link>
                </nav>

                <div className="p-2 border-t border-slate-800">
                    <div className="px-3 py-2 flex items-center mb-2 md:hidden">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            {user?.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="hidden md:flex items-center px-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {user?.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <div className="text-sm font-medium text-white truncate">{user?.username}</div>
                            <div className="text-xs text-slate-500">Online</div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    >
                        <LogOut size={20} className="shrink-0" />
                        <span className="ml-3 hidden md:block">Log Out</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 ml-16 md:ml-64 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};
