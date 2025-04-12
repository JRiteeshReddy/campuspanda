
import React, { useState, useRef, useEffect } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import Navbar from '@/components/layout/Navbar';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const PandaChat = () => {
  useDocumentTitle();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey there, friend! 👋 I'm PandaChat, your campus buddy! How's your day going? Anything exciting happening in your college life that you want to chat about?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatboxRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Set up the API request
      const API_KEY = "sk-fbc3b5c654e5473dbd97994f86f63fa4"; // Using the key from the DeepSeek function
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { 
              role: 'system', 
              content: "You are PandaChat, a friendly and enthusiastic AI companion for college students. Talk to the user as if you're their friend - be warm, empathetic, and even a bit humorous. Use a conversational tone, occasional emojis, and show genuine interest in their campus life." 
            },
            ...messages.filter(m => m.role === 'user' || m.role === 'assistant'),
            userMessage
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      const data = await response.json();
      const reply = data.choices[0].message.content;
      
      // Add AI response to chat
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: "Oops! 🐼 Something went wrong. Could you try sending your message again?" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf6f6] flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-6 container max-w-4xl mx-auto px-4 flex flex-col">
        <h2 className="text-center text-2xl font-bold text-[#2c3e50] mb-4">🐼 Panda AI - Chat with me!</h2>
        
        {/* Chatbox */}
        <div 
          ref={chatboxRef}
          className="border-2 border-[#d1d1d1] rounded-xl p-5 h-[400px] bg-white overflow-y-auto mb-4"
        >
          {messages.map((message, index) => (
            <div key={index} className={`my-3 ${message.role === 'user' ? 'text-[#444]' : 'text-[#27ae60] font-bold'}`}>
              {message.role === 'user' ? '👤 You: ' : '🐼 Panda AI: '}
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="text-[#27ae60] font-bold my-3">
              🐼 Panda AI is typing...
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="flex items-center justify-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Panda AI something..."
            onKeyDown={handleKeyDown}
            className="py-3 px-4 text-base w-4/5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#27ae60]"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="py-3 px-4 w-1/5 bg-[#27ae60] hover:bg-[#219150] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
};

export default PandaChat;
