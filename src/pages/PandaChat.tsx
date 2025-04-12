
import React, { useState, useRef, useEffect } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import Navbar from '@/components/layout/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PandaChat = () => {
  useDocumentTitle();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi there! I\'m PandaChat, your campus life assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const systemPrompt = 
        "You are PandaChat, a friendly and helpful AI assistant for college students. " + 
        "You provide information about campus life, study tips, time management advice, and help with student-related queries. " +
        "Keep your answers concise, friendly, and focused on helping students succeed in their academic and campus life.";
      
      const { data, error } = await supabase.functions.invoke('deepseek-chat', {
        body: {
          messages: [userMessage],
          systemPrompt: systemPrompt
        }
      });
      
      if (error) {
        console.error('Error calling DeepSeek API:', error);
        toast({
          variant: "destructive",
          title: "Chat Error",
          description: "Sorry, I couldn't process your request. Please try again."
        });
        return;
      }
      
      if (data && data.success && data.answer) {
        setMessages((prev) => [...prev, { 
          role: 'assistant', 
          content: data.answer 
        }]);
      } else {
        toast({
          variant: "destructive",
          title: "Chat Error",
          description: "Received an invalid response. Please try again."
        });
      }
    } catch (error) {
      console.error('Error in chat request:', error);
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12 container max-w-4xl mx-auto px-4 flex flex-col">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-primary dark:text-white">PandaChat</h1>
          <p className="text-muted-foreground dark:text-white/70">Your campus life assistant</p>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="bg-card dark:bg-card shadow-md rounded-lg p-4 flex-1 overflow-y-auto max-h-[60vh] mb-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 
                                   ${message.role === 'user' ? 'bg-primary ml-2' : 'bg-secondary mr-2'}`}>
                      {message.role === 'user' ? 
                        <User size={16} className="text-white" /> : 
                        <Bot size={16} className="text-white" />
                      }
                    </div>
                    <div className={`px-4 py-2 rounded-lg 
                                   ${message.role === 'user' 
                                      ? 'bg-primary text-white rounded-tr-none' 
                                      : 'bg-muted rounded-tl-none'}`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="h-auto"
            >
              <Send size={20} />
            </Button>
          </form>
          
          {isLoading && (
            <div className="text-center text-muted-foreground text-sm mt-2">
              Thinking...
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PandaChat;
