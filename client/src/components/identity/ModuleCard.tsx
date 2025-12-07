import React from 'react';
import { IdentityModule } from '../../types/identity';
import { Mail, Briefcase, Calendar, Shield, CreditCard, LayoutGrid } from 'lucide-react';

interface ModuleCardProps {
    module: IdentityModule;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
    const getIcon = () => {
        switch (module.key) {
            case 'email': return <Mail size={24} className="text-blue-400" />;
            case 'services': return <Briefcase size={24} className="text-orange-400" />;
            case 'subscriptions': return <CreditCard size={24} className="text-green-400" />;
            case 'tasks': return <Calendar size={24} className="text-purple-400" />;
            case 'adminLinks': return <Shield size={24} className="text-red-400" />;
            default: return <LayoutGrid size={24} className="text-gray-400" />;
        }
    };

    const statusColors = {
        planned: 'bg-gray-800 text-gray-500 border-gray-700',
        active: 'bg-green-900/30 text-green-400 border-green-800',
        disabled: 'bg-red-900/30 text-red-400 border-red-800',
    };

    return (
        <div className={`
      relative rounded-xl overflow-hidden border transition-all duration-300
      ${module.enabled
                ? 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                : 'bg-gray-950/20 border-gray-800/50 opacity-60'}
    `}>
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                        {getIcon()}
                    </div>

                    <div className={`px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wider ${statusColors[module.status]}`}>
                        {module.status}
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-200 mb-2">{module.name}</h3>
                <p className="text-sm text-gray-500 mb-6 min-h-[40px]">{module.description}</p>

                {module.enabled ? (
                    <div className="p-4 rounded-lg bg-gray-950/50 border border-dashed border-gray-800/50 text-center">
                        <span className="text-xs text-gray-600 block mb-1">Module Content</span>
                        <span className="text-sm text-gray-500 font-medium">Coming Soon in Stage 3</span>
                    </div>
                ) : (
                    <div className="p-4 text-center">
                        <span className="text-sm text-gray-600 italic">Module disabled</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModuleCard;
