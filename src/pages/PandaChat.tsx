
import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import ChatMessage from '@/components/chat/ChatMessage';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  text: string;
  isBot: boolean;
}

const PandaChat = () => {
  useDocumentTitle();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsLoading(true);

    try {
      // Use supabase.functions.invoke instead of direct fetch
      const { data, error } = await supabase.functions.invoke('chat-gpt', {
        body: { message: userMessage },
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive",
      });
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-6 container max-w-4xl mx-auto px-4 flex flex-col">
        <Card className="shadow-md w-full flex flex-col h-[calc(100vh-140px)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold flex items-center justify-center">
              <span className="mr-2">🐼</span> Chat with PandaAI
            </CardTitle>
            <Separator className="my-2" />
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Start a conversation with PandaAI! Ask about study tips, college life, or academic advice.
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <ChatMessage key={idx} message={msg.text} isBot={msg.isBot} />
                ))
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PandaChat;
