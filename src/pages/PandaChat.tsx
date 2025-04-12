import React, { useState, useRef, useEffect } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import Navbar from '@/components/layout/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

const PandaChat = () => {
  useDocumentTitle();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey there, friend! 👋 I'm PandaChat, your campus buddy! How's your day going? Anything exciting happening in your college life that you want to chat about?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = { 
      role: 'user' as const, 
      content: input.trim(),
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const systemPrompt = 
        "You are PandaChat, a friendly and enthusiastic AI companion for college students. " +
        "Talk to the user as if you're their friend - be warm, empathetic, and even a bit humorous. " +
        "Use a conversational tone, occasional emojis, and show genuine interest in their campus life. " +
        "Ask follow-up questions when appropriate. Keep your answers conversational and friendly. " +
        "If they ask about campus topics, classes, or student life, provide helpful advice while maintaining a friendly tone. " +
        "Always be supportive and encouraging.";
      
      const { data, error } = await supabase.functions.invoke('deepseek-chat', {
        body: {
          messages: [
            ...messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-5),
            userMessage
          ],
          systemPrompt: systemPrompt
        }
      });
      
      if (error) {
        console.error('Error calling DeepSeek API:', error);
        toast({
          variant: "destructive",
          title: "Chat Error",
          description: "Sorry, I couldn't process your message. Let's try again!"
        });
        return;
      }
      
      if (data && data.success && data.answer) {
        setTimeout(() => {
          setMessages((prev) => [...prev, { 
            role: 'assistant', 
            content: data.answer,
            timestamp: new Date()
          }]);
          setIsLoading(false);
        }, 500);
      } else {
        toast({
          variant: "destructive",
          title: "Chat Error",
          description: "I didn't catch that. Mind trying again?"
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in chat request:', error);
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: "Oops! Something went wrong. Let's try that again!"
      });
      setIsLoading(false);
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Hey there! Starting fresh! What's on your mind today?",
      timestamp: new Date()
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12 container max-w-4xl mx-auto px-4 flex flex-col">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-primary dark:text-white">PandaChat</h1>
          <p className="text-muted-foreground dark:text-white/70">Your friendly campus companion</p>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="bg-card dark:bg-card shadow-md rounded-lg p-4 flex-1 overflow-y-auto max-h-[60vh] mb-4 relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-2 right-2 p-2 h-8 w-8" 
              onClick={clearChat}
              title="Clear chat"
            >
              <RefreshCw size={16} />
            </Button>
            
            <div className="space-y-4 pt-2">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 
                                   ${message.role === 'user' ? 'bg-primary ml-2' : 'bg-purple-500 mr-2'}`}>
                      {message.role === 'user' ? 
                        <User size={16} className="text-white" /> : 
                        <Bot size={16} className="text-white" />
                      }
                    </div>
                    <div className={`px-4 py-3 rounded-lg relative group
                                   ${message.role === 'user' 
                                      ? 'bg-primary text-white rounded-tr-none' 
                                      : 'bg-muted dark:bg-slate-700 rounded-tl-none'}`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 opacity-60 
                                     ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex flex-row">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full shrink-0 bg-purple-500 mr-2">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="px-4 py-3 rounded-lg bg-muted dark:bg-slate-700 rounded-tl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '400ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message PandaChat..."
              className="flex-1 resize-none min-h-[60px] p-3"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              maxLength={1000}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="h-[60px] w-[60px] rounded-full bg-primary hover:bg-primary/90"
            >
              <Send size={20} className="text-white" />
            </Button>
          </form>
          
          {isLoading && (
            <div className="text-center text-muted-foreground text-sm mt-2">
              PandaChat is thinking...
            </div>
          )}
          
          <div className="text-center text-xs text-muted-foreground mt-4">
            {input.length > 0 && (
              <p>{1000 - input.length} characters remaining</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PandaChat;
