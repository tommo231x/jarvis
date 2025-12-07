import React, { useState } from 'react';
import { useModuleData } from '../../../context/ModuleDataContext';
import { AdminLinkRecord } from '../../../types/moduleData';
import { v4 as uuidv4 } from 'uuid';
import { Shield, Plus, X, ExternalLink, Trash2 } from 'lucide-react';

interface AdminLinksModuleProps {
    identityId: string;
}

const AdminLinksModule: React.FC<AdminLinksModuleProps> = ({ identityId }) => {
    const { getModuleData, addItem, removeItem } = useModuleData();
    const links = getModuleData<AdminLinkRecord>(identityId, 'adminLinks');
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ label: '', url: '' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addItem(identityId, 'adminLinks', {
            id: uuidv4(),
            ...newItem,
        });
        setNewItem({ label: '', url: '' });
        setIsAdding(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-400">Quick Links ({links.length})</h4>
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
                        placeholder="Label"
                        value={newItem.label}
                        onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                        required
                    />
                    <input
                        className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1 text-sm text-white"
                        placeholder="URL"
                        value={newItem.url}
                        onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                        required
                    />
                    <button type="submit" className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs py-1 rounded">
                        Add Link
                    </button>
                </form>
            )}

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {links.map(link => (
                    <div key={link.id} className="relative group p-3 rounded bg-gray-900/30 border border-gray-800/50 hover:bg-gray-900/50 hover:border-gray-700 transition-all">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mb-1">
                            <Shield size={12} className="text-red-400" />
                            <span className="text-sm font-medium text-gray-200 truncate">{link.label}</span>
                            <ExternalLink size={10} className="text-gray-600" />
                        </a>
                        <button
                            onClick={() => removeItem(identityId, 'adminLinks', link.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-opacity"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
                {links.length === 0 && !isAdding && (
                    <p className="text-xs text-gray-500 italic text-center py-4 col-span-2">No links.</p>
                )}
            </div>
        </div>
    );
};

export default AdminLinksModule;
