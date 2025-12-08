import React, { useState, useRef, useEffect } from "react";
import { api } from "../../api";
import { useAICommandExecutor } from "../../hooks/useAICommandExecutor";
import { 
  MessageSquare, 
  X, 
  Send, 
  RotateCcw, 
  Sparkles, 
  Clock,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Bot,
  User
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "jarvis";
  text: string;
  timestamp: Date;
}

interface QuickAction {
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

const quickActions: QuickAction[] = [
  { label: "Summarize inbox", prompt: "Summarize my inbox and highlight any urgent items", icon: <Sparkles className="w-3 h-3" /> },
  { label: "Monthly costs", prompt: "What are my total monthly subscription costs?", icon: <Clock className="w-3 h-3" /> },
  { label: "Security alerts", prompt: "Are there any security alerts I should be aware of?", icon: <Bot className="w-3 h-3" /> },
];

const STORAGE_KEY = 'jarvis-chat-history';

const loadMessagesFromStorage = (): Message[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (e) {
    console.error('Failed to load chat history:', e);
  }
  return [];
};

const saveMessagesToStorage = (messages: Message[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat history:', e);
  }
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => loadMessagesFromStorage());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { executeAll } = useAICommandExecutor();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages]);

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleSend = async (customPrompt?: string) => {
    const messageText = customPrompt || input;
    if (!messageText.trim() || isLoading) return;

    const userMsg: Message = { 
      id: generateId(),
      sender: "user", 
      text: messageText,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await api.ai.query(messageText);
      const answer = data?.answer || "I didn't understand that.";

      const jarvisMsg: Message = { 
        id: generateId(),
        sender: "jarvis", 
        text: answer,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, jarvisMsg]);

      if (data?.commands && data.commands.length > 0) {
        const results = await executeAll(data.commands);
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;
        
        if (successCount > 0 || failCount > 0) {
          const executionSummary = results
            .map(r => `${r.success ? '✓' : '✗'} ${r.message}`)
            .join('\n');
          
          const execMsg: Message = {
            id: generateId(),
            sender: "jarvis",
            text: `**Actions completed:**\n${executionSummary}`,
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, execMsg]);
        }
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: generateId(),
        sender: "jarvis",
        text: err?.message?.includes("Unauthorized") 
          ? "Please log in to use the Jarvis AI assistant."
          : "There was an error contacting the Jarvis AI service.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleCopyMessage = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] group"
        aria-label="Open Jarvis Chat"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
        </div>
      </button>
    );
  }

  const windowClasses = isExpanded 
    ? "fixed inset-4 z-[9999]" 
    : "fixed bottom-6 right-6 w-96 h-[600px] z-[9999]";

  return (
    <div className={`${windowClasses} bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
      <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Jarvis</h3>
            <p className="text-xs text-slate-400">GPT-5.1 Powered</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
            title="Clear conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-900 to-slate-950">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-violet-400" />
            </div>
            <h4 className="text-white font-medium mb-2">How can I help you?</h4>
            <p className="text-slate-400 text-sm mb-6">
              I can analyze your inbox, track subscriptions, and manage your digital identity.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.prompt)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 hover:text-white transition disabled:opacity-50"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.sender === "user" 
                ? "bg-gradient-to-br from-blue-500 to-cyan-500" 
                : "bg-gradient-to-br from-violet-500 to-indigo-600"
            }`}>
              {msg.sender === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`group max-w-[80%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-md"
                  : "bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700/50"
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
              <div className={`flex items-center gap-2 mt-1 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <span className="text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
                {msg.sender === "jarvis" && (
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.text)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/50">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleSend(action.prompt)}
                disabled={isLoading}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 rounded-full text-xs text-slate-400 hover:text-white transition disabled:opacity-50"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 border-t border-slate-700/50 bg-slate-900">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
            placeholder="Ask Jarvis anything..."
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
