import React from 'react';
import { IdentityModule } from '../../types/identity';
import { Mail, Briefcase, Calendar, Shield, CreditCard, LayoutGrid } from 'lucide-react';
import EmailModule from './modules/EmailModule';
import ServicesModule from './modules/ServicesModule';
import SubscriptionsModule from './modules/SubscriptionsModule';
import TasksModule from './modules/TasksModule';
import AdminLinksModule from './modules/AdminLinksModule';

interface ModuleCardProps {
    module: IdentityModule;
    identityId: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, identityId }) => {
    const getIcon = () => {
        switch (module.key) {
            case 'email': return <Mail size={20} className="text-blue-400" />;
            case 'services': return <Briefcase size={20} className="text-orange-400" />;
            case 'subscriptions': return <CreditCard size={20} className="text-green-400" />;
            case 'tasks': return <Calendar size={20} className="text-purple-400" />;
            case 'adminLinks': return <Shield size={20} className="text-red-400" />;
            default: return <LayoutGrid size={20} className="text-gray-400" />;
        }
    };

    const renderModuleContent = () => {
        switch (module.key) {
            case 'email': return <EmailModule identityId={identityId} />;
            case 'services': return <ServicesModule identityId={identityId} />;
            case 'subscriptions': return <SubscriptionsModule identityId={identityId} />;
            case 'tasks': return <TasksModule identityId={identityId} />;
            case 'adminLinks': return <AdminLinksModule identityId={identityId} />;
            default: return <p className="text-gray-500">Module content not found.</p>;
        }
    };

    return (
        <div className={`
      relative rounded-xl overflow-hidden border transition-all duration-300 flex flex-col h-full
      ${module.enabled
                ? 'bg-[#0a0a0a] border-white/5 hover:border-white/10 shadow-lg shadow-black/50'
                : 'bg-gray-950/20 border-gray-800/50 opacity-60'}
    `}>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-200 leading-tight">{module.name}</h3>
                        <p className="text-xs text-gray-500">{module.category}</p>
                    </div>
                </div>

                {module.enabled ? (
                    <div className="flex-1">
                        {renderModuleContent()}
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
