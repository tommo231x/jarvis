import React from "react";

interface ChatBubbleProps {
  onClick: () => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all"
      aria-label="Open Jarvis Chat"
    >
      💬
    </button>
  );
};

export default ChatBubble;
