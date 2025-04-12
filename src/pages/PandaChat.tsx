
import React, { useState, useRef, useEffect } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
    const userText = input.trim();
    if (!userText) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: userText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Set up the API request
      const API_KEY = "sk-6351ef57c07a4d99b5172efc80466de2";
      const endpoint = "https://api.deepseek.com/v1/chat/completions";
      
      const response = await fetch(endpoint, {
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
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const reply = data.choices[0].message.content;
      
      // Add AI response to chat
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('🐼 DeepSeek Error:', error);
      // Add error message to chat
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: `Oops! 🐼 Something went wrong...\n${error instanceof Error ? error.message : 'Unknown error'}` 
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-6 container max-w-4xl mx-auto px-4 flex flex-col">
        <Card className="shadow-md w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold flex items-center justify-center">
              <span className="mr-2">🐼</span> Panda AI Chat
            </CardTitle>
            <Separator className="my-2" />
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Chatbox */}
            <div 
              ref={chatboxRef}
              className="border rounded-lg p-4 h-[400px] bg-card overflow-y-auto mb-4"
            >
              {messages.map((message, index) => (
                <div key={index} className={`my-3 ${message.role === 'user' ? 'text-foreground' : 'text-primary font-semibold'}`}>
                  {message.role === 'user' ? '👤 You: ' : '🐼 Panda AI: '}
                  {message.content}
                </div>
              ))}
              {isLoading && (
                <div className="text-primary font-semibold my-3">
                  🐼 Panda AI is typing...
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Panda AI something..."
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                variant="default"
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PandaChat;
