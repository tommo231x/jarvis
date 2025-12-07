import React, { useState } from 'react';
import { useModuleData } from '../../../context/ModuleDataContext';
import { TaskRecord } from '../../../types/moduleData';
import { v4 as uuidv4 } from 'uuid';
import { Plus, X, Square, CheckSquare } from 'lucide-react';

interface TasksModuleProps {
    identityId: string;
}

const TasksModule: React.FC<TasksModuleProps> = ({ identityId }) => {
    const { getModuleData, addItem, updateItem } = useModuleData();
    const tasks = getModuleData<TaskRecord>(identityId, 'tasks');
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ title: '' });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addItem(identityId, 'tasks', {
            id: uuidv4(),
            title: newItem.title,
            isDone: false,
        });
        setNewItem({ title: '' });
        setIsAdding(false);
    };

    const toggleTask = (task: TaskRecord) => {
        updateItem(identityId, 'tasks', task.id, { isDone: !task.isDone });
    };

    const activeCount = tasks.filter(t => !t.isDone).length;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-400">Tasks ({activeCount} open)</h4>
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
                        placeholder="New Task..."
                        value={newItem.title}
                        onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                        required
                    />
                    <button type="submit" className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs py-1 rounded">
                        Add Task
                    </button>
                </form>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {tasks.sort((a, b) => (a.isDone === b.isDone ? 0 : a.isDone ? 1 : -1)).map(task => (
                    <div key={task.id} className={`flex items-start gap-3 p-2 rounded hover:bg-gray-900/30 group ${task.isDone ? 'opacity-50' : ''}`}>
                        <button onClick={() => toggleTask(task)} className="mt-0.5 text-gray-500 hover:text-blue-400">
                            {task.isDone ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                        <span className={`text-sm ${task.isDone ? 'text-gray-600 line-through' : 'text-gray-300'}`}>{task.title}</span>
                    </div>
                ))}
                {tasks.length === 0 && !isAdding && (
                    <p className="text-xs text-gray-500 italic text-center py-4">No tasks.</p>
                )}
            </div>
        </div>
    );
};

export default TasksModule;
