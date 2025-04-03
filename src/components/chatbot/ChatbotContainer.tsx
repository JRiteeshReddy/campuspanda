
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import ChatMessage, { Message } from './ChatMessage';
import ChatInput from './ChatInput';

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
    <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>PandaAI Chat</CardTitle>
        </div>
        <CardDescription>
          Your AI campus assistant powered by DeepSeek
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto mb-2 px-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && (
            <ChatMessage 
              message={{ role: 'assistant', content: "Thinking..." }} 
              isLoading={true}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading || !user} 
        />
      </CardFooter>
    </Card>
  );
};

export default ChatbotContainer;
