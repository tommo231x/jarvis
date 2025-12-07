import React, { useState } from 'react';
import { useModuleData } from '../../../context/ModuleDataContext';
import { ServiceRecord } from '../../../types/moduleData';
import { v4 as uuidv4 } from 'uuid';
import { Briefcase, Plus, X, Trash2, ExternalLink } from 'lucide-react';

interface ServicesModuleProps {
    identityId: string;
}

const ServicesModule: React.FC<ServicesModuleProps> = ({ identityId }) => {
    const { getModuleData, addItem, removeItem } = useModuleData();
    const services = getModuleData<ServiceRecord>(identityId, 'services');
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', url: '' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addItem(identityId, 'services', {
            id: uuidv4(),
            ...newItem,
        });
        setNewItem({ name: '', url: '' });
        setIsAdding(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-400">Connected Services ({services.length})</h4>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-1 rounded hover:bg-gray-800 text-blue-400"
                >
                    {isAdding ? <X size={16} /> : <Plus size={16} />}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 space-y-2 mb-4">
                    <input
                        className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1 text-sm text-white"
                        placeholder="Service Name (e.g. Netflix)"
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        required
                    />
                    <input
                        className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1 text-sm text-white"
                        placeholder="URL (optional)"
                        value={newItem.url}
                        onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                    />
                    <button type="submit" className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs py-1 rounded">
                        Add Service
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {services.map(service => (
                    <div key={service.id} className="flex justify-between items-center p-2 rounded bg-gray-900/30 border border-gray-800/50 hover:bg-gray-900/50 group">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Briefcase size={14} className="text-orange-400 flex-shrink-0" />
                            <span className="text-sm text-gray-200 truncate">{service.name}</span>
                            {service.url && (
                                <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white">
                                    <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                        <button
                            onClick={() => removeItem(identityId, 'services', service.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-opacity"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
                {services.length === 0 && !isAdding && (
                    <p className="text-xs text-gray-500 italic text-center py-4">No services added.</p>
                )}
            </div>
        </div>
    );
};

export default ServicesModule;
