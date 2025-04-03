
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import ChatMessage, { Message } from './ChatMessage';
import ChatInput from './ChatInput';
import { useIsMobile } from '@/hooks/use-mobile';

const SYSTEM_PROMPT = "You are PandaAI, a helpful assistant for college students using the CampusPanda app. You help with assignments, study tips, campus events, and general academic advice. Keep your responses concise, friendly, and focused on helping students succeed in their academic journey.";

const ChatbotContainer = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi there! I'm PandaAI, your campus assistant. How can I help you today? You can ask me about assignments, study tips, or any campus-related questions!"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (content: string) => {
    if (isLoading) return;
    
    // Add user message
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Prepare all previous messages for context (excluding the initial greeting)
      const messagesToSend = messages.length > 1 ? 
        messages.slice(1).concat(userMessage) : 
        [userMessage];
      
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('deepseek-chat', {
        body: {
          messages: messagesToSend,
          systemPrompt: SYSTEM_PROMPT
        }
      });
      
      if (error) throw new Error(error.message);
      
      if (data.success && data.answer) {
        // Add AI response
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        throw new Error('Failed to get a response from the AI');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Chat Error',
        description: 'Unable to get a response. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col bg-background rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && (
            <ChatMessage 
              message={{ role: 'assistant', content: "..." }} 
              isLoading={true}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t p-4">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading || !user} 
        />
      </div>
    </div>
  );
};

export default ChatbotContainer;
