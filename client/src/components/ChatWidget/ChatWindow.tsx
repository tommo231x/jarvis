import React from "react";

interface Message {
  sender: "user" | "jarvis";
  text: string;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  isLoading?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  messages,
  input,
  onInputChange,
  onSend,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-80 z-[9999] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[500px]">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800 text-white flex justify-between items-center">
        <span className="font-semibold">Jarvis Assistant</span>
        <button
          onClick={onClose}
          className="text-white hover:text-slate-300 transition"
        >
          ▾
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-3 py-2 rounded-xl ${
              msg.sender === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && onSend()}
          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
          placeholder="Ask Jarvis something…"
          disabled={isLoading}
        />
        <button
          onClick={onSend}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl transition"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
