import { useState, FormEvent } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { api } from '../../api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export const AIQuery = () => {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAsk = async (e: FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setAnswer('');

        try {
            const res = await api.ai.query(query);
            setAnswer(res.answer || 'No answer returned.');
        } catch (err: any) {
            setError(err.message || 'Failed to get answer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-white" size={24} />
                </div>
                <h2 className="text-3xl font-bold text-white">Ask Jarvis</h2>
                <p className="text-slate-400">Query your database using natural language.</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                <form onSubmit={handleAsk} className="flex gap-2">
                    <Input
                        autoFocus
                        placeholder="e.g. Which email do I use for CD Baby?"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={loading || !query.trim()}>
                        {loading ? 'Thinking...' : <Send size={18} />}
                    </Button>
                </form>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 text-center">
                    {error}
                </div>
            )}

            {answer && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Jarvis Analysis</h3>
                    <div className="prose prose-invert max-w-none">
                        <p className="text-lg text-slate-100 leading-relaxed whitespace-pre-wrap">{answer}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    "Show me all dev tools and their emails.",
                    "Which projects are currently active?",
                    "What services am I paying for monthly?",
                    "How many emails do I have?"
                ].map((q, i) => (
                    <button
                        key={i}
                        className="p-3 text-left text-sm text-slate-400 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                        onClick={() => setQuery(q)}
                    >
                        "{q}"
                    </button>
                ))}
            </div>
        </div>
    );
};
