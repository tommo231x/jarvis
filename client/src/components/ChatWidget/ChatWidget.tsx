import React, { useState } from "react";
import ChatBubble from "./ChatBubble";
import ChatWindow from "./ChatWindow";
import { api } from "../../api";

interface Message {
  sender: "user" | "jarvis";
  text: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const query = input;
    setInput("");
    setIsLoading(true);

    try {
      const data = await api.ai.query(query);
      const answer = data?.answer || "I didn't understand that.";

      const jarvisMsg: Message = { sender: "jarvis", text: answer };
      setMessages((prev) => [...prev, jarvisMsg]);

    } catch (err: any) {
      const errorMsg: Message = {
        sender: "jarvis",
        text: err?.message?.includes("Unauthorized") 
          ? "Please log in to use the Jarvis AI assistant."
          : "There was an error contacting the Jarvis AI service.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
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
        isLoading={isLoading}
      />
    </>
  );
};

export default ChatWidget;
