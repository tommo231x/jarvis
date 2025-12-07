import { Link } from 'react-router-dom';
import { Database, CreditCard, Folder, Search } from 'lucide-react';

export const IdentityHome = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Identity & Services Command</h2>
                    <p className="text-slate-400">Manage digital footprint and resources.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Emails', path: 'emails', icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Services', path: 'services', icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Projects', path: 'projects', icon: Folder, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'AI Query', path: 'ai', icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                ].map((item) => (
                    <Link key={item.path} to={item.path} className="p-4 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
                        <div className={`w-8 h-8 rounded ${item.bg} ${item.color} flex items-center justify-center mb-3`}>
                            <item.icon size={18} />
                        </div>
                        <div className="font-medium text-slate-200">{item.label}</div>
                    </Link>
                ))}
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-medium text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Total Services</div>
                        <div className="text-2xl font-bold text-white">--</div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Active Projects</div>
                        <div className="text-2xl font-bold text-white">--</div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">Monthly Cost</div>
                        <div className="text-2xl font-bold text-emerald-400">$0.00</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
