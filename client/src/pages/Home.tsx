import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, CreditCard, Folder, Calendar } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        monthlyCost: 0,
        activeProjects: 0,
        nextRenewal: null as string | null,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [services, projects] = await Promise.all([
                    api.services.list(),
                    api.projects.list()
                ]);

                // Calculate Monthly Cost
                const monthlyCost = services.reduce((total, service) => {
                    if (!service.cost || service.status === 'cancelled') return total;
                    if (service.billingCycle === 'monthly') return total + service.cost.amount;
                    if (service.billingCycle === 'yearly') return total + (service.cost.amount / 12);
                    return total;
                }, 0);

                // Count Active Projects
                const activeProjects = projects.filter(p => p.status === 'active').length;

                // Find Next Renewal
                const renewals = services
                    .filter(s => s.status === 'active' && s.renewalDate)
                    .map(s => s.renewalDate!)
                    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                const nextRenewal = renewals.length > 0 ? renewals[0] : null;

                setStats({ monthlyCost, activeProjects, nextRenewal });
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">{greeting()}, {user?.username}.</h2>
                <p className="text-slate-400">System status: <span className="text-emerald-400 font-medium">Operational</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Monthly Cost Widget */}
                <div className="p-6 rounded-xl bg-slate-800 border border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard size={64} />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Monthly Burn</h3>
                    <div className="text-3xl font-bold text-white mb-2">
                        {isLoading ? '...' : `$${stats.monthlyCost.toFixed(2)}`}
                    </div>
                    <p className="text-xs text-slate-500">Estimated recurring costs</p>
                </div>

                {/* Active Projects Widget */}
                <div className="p-6 rounded-xl bg-slate-800 border border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Folder size={64} />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Active Projects</h3>
                    <div className="text-3xl font-bold text-white mb-2">
                        {isLoading ? '...' : stats.activeProjects}
                    </div>
                    <p className="text-xs text-slate-500">Contexts currently in progress</p>
                </div>

                {/* Renewal Widget */}
                <div className="p-6 rounded-xl bg-slate-800 border border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar size={64} />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Next Renewal</h3>
                    <div className="text-xl font-bold text-white mb-2 mt-2">
                        {isLoading ? '...' : (stats.nextRenewal ? new Date(stats.nextRenewal).toLocaleDateString() : 'None')}
                    </div>
                    <p className="text-xs text-slate-500">Upcoming payment</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/apps/identity" className="group block p-6 rounded-xl bg-slate-800 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Shield size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Identity Hub</h3>
                    <p className="text-slate-400 text-sm mb-4">Manage emails, service credentials, and project associations.</p>
                    <div className="flex items-center text-blue-400 text-sm font-medium">
                        Access System <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                {/* Placeholder for future apps */}
                <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-800 border-dashed flex flex-col items-center justify-center text-center opacity-50 hover:opacity-75 transition-opacity cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center mb-4 text-slate-500">
                        <span className="text-2xl">+</span>
                    </div>
                    <p className="text-slate-500 text-sm">Add Module</p>
                </div>
            </div>
        </div>
    );
};
