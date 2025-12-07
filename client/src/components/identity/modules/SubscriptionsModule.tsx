import React, { useState } from 'react';
import { useModuleData } from '../../../context/ModuleDataContext';
import { SubscriptionRecord } from '../../../types/moduleData';
import { v4 as uuidv4 } from 'uuid';
import { CreditCard, Plus, X, Trash2 } from 'lucide-react';

interface SubscriptionsModuleProps {
    identityId: string;
}

const SubscriptionsModule: React.FC<SubscriptionsModuleProps> = ({ identityId }) => {
    const { getModuleData, addItem, removeItem } = useModuleData();
    const subs = getModuleData<SubscriptionRecord>(identityId, 'subscriptions');
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState<Partial<SubscriptionRecord>>({ name: '', amount: 0, currency: 'GBP', frequency: 'monthly' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addItem(identityId, 'subscriptions', {
            id: uuidv4(),
            name: newItem.name!,
            amount: Number(newItem.amount) || 0,
            currency: newItem.currency || 'GBP',
            frequency: newItem.frequency || 'monthly',
        });
        setNewItem({ name: '', amount: 0, currency: 'GBP', frequency: 'monthly' });
        setIsAdding(false);
    };

    const totalMonthly = subs.reduce((acc, sub) => {
        const amount = sub.amount;
        return acc + (sub.frequency === 'yearly' ? amount / 12 : amount);
    }, 0);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="text-sm font-medium text-gray-400">Subscriptions ({subs.length})</h4>
                    <p className="text-xs text-gray-500">~£{totalMonthly.toFixed(2)} / mo</p>
                </div>
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
                        placeholder="Name (e.g. Spotify)"
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        required
                    />
                    <div className="flex gap-2">
                        <input
                            type="number" step="0.01"
                            className="w-1/2 bg-gray-950 border border-gray-800 rounded px-2 py-1 text-sm text-white"
                            placeholder="Amount"
                            value={newItem.amount || ''}
                            onChange={e => setNewItem({ ...newItem, amount: parseFloat(e.target.value) })}
                            required
                        />
                        <select
                            className="w-1/2 bg-gray-950 border border-gray-800 rounded px-2 py-1 text-sm text-white"
                            value={newItem.frequency}
                            onChange={e => setNewItem({ ...newItem, frequency: e.target.value as any })}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs py-1 rounded">
                        Add Subscription
                    </button>
                </form>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {subs.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center p-2 rounded bg-gray-900/30 border border-gray-800/50 hover:bg-gray-900/50 group">
                        <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-green-400" />
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-200">{sub.name}</span>
                                <span className="text-[10px] text-gray-500 uppercase">{sub.frequency}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-gray-300">{sub.currency} {sub.amount.toFixed(2)}</span>
                            <button
                                onClick={() => removeItem(identityId, 'subscriptions', sub.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-opacity"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                {subs.length === 0 && !isAdding && (
                    <p className="text-xs text-gray-500 italic text-center py-4">No subscriptions added.</p>
                )}
            </div>
        </div>
    );
};

export default SubscriptionsModule;
