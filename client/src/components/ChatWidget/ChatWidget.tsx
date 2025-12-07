import React, { useState } from "react";
import ChatBubble from "./ChatBubble";
import ChatWindow from "./ChatWindow";

interface Message {
  sender: "user" | "jarvis";
  text: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const query = input;
    setInput("");

    try {
      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      const answer = data?.answer || "I didn't understand that.";

      const jarvisMsg: Message = { sender: "jarvis", text: answer };
      setMessages((prev) => [...prev, jarvisMsg]);

    } catch (err) {
      const errorMsg: Message = {
        sender: "jarvis",
        text: "There was an error contacting the Jarvis AI service.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <>
      <ChatBubble onClick={() => setIsOpen(true)} />

      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSend={handleSend}
      />
    </>
  );
};

export default ChatWidget;
