import { useState, FormEvent } from 'react';
import { Send, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { BackButton } from '../../components/BackButton';
import { useAICommandExecutor } from '../../hooks/useAICommandExecutor';

export const AIQuery = () => {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [executions, setExecutions] = useState<{ summary: string; success: boolean }[]>([]);

    const { executeAll } = useAICommandExecutor();

    const handleAsk = async (e: FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setAnswer('');
        setExecutions([]);

        try {
            const res = await api.ai.query(query);
            setAnswer(res.answer || 'No answer returned.');

            if (res.commands && res.commands.length > 0) {
                const results = await executeAll(res.commands);
                setExecutions(results.map(r => ({
                    summary: r.message,
                    success: r.success
                })));
            }

        } catch (err: any) {
            setError(err.message || 'Failed to get answer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <BackButton to="/" label="Back to Dashboard" />
            
            <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                    <Sparkles className="text-white" size={24} />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Ask Jarvis</h2>
                <p className="text-slate-400">Manage your identity system with natural language.</p>
            </div>

            <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-white/5 shadow-2xl shadow-blue-900/10">
                <form onSubmit={handleAsk} className="flex gap-3">
                    <Input
                        autoFocus
                        placeholder="e.g. Add a task to renew my domain..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="flex-1 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                    />
                    <Button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white border-none shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    >
                        {loading ? <Sparkles size={18} className="animate-spin" /> : <Send size={18} />}
                    </Button>
                </form>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-center text-sm">
                    {error}
                </div>
            )}

            {(answer || executions.length > 0) && (
                <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-white/5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>

                    {answer && (
                        <div className="mb-6 relative z-10">
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Sparkles size={12} /> Analysis
                            </h3>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">{answer}</p>
                            </div>
                        </div>
                    )}

                    {executions.length > 0 && (
                        <div className="relative z-10 pt-6 border-t border-white/10">
                            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <CheckCircle size={12} /> Execution Log
                            </h3>
                            <ul className="space-y-2">
                                {executions.map((exec, i) => (
                                    <li key={i} className={`flex items-start gap-2 text-sm ${exec.success ? 'text-gray-300' : 'text-rose-400'}`}>
                                        <div className={`mt-0.5 ${exec.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {exec.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        </div>
                                        <span>{exec.summary}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    "Create a 'Studio' identity for business",
                    "Add task 'File taxes' to Studio",
                    "Add monthly Netflix subscription ($15) to Personal",
                    "What tasks are open for Studio?"
                ].map((q, i) => (
                    <button
                        key={i}
                        className="p-4 text-left text-sm text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
                        onClick={() => setQuery(q)}
                    >
                        "{q}"
                    </button>
                ))}
            </div>
        </div>
    );
};
