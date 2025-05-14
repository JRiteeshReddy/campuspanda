
import { useState } from 'react';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

const AI = () => {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'ai', content: 'Hello! How can I help you with your studies today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessageToWebhook = async (message: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5678/webhook-test/063c029b-45b7-4a00-8cdc-e5f0bcabe152', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data.output;
    } catch (error) {
      console.error('Error calling webhook:', error);
      toast.error('Failed to get response from AI. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage = { type: 'user' as const, content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Send to webhook and get response
    const webhookResponse = await sendMessageToWebhook(input.trim());
    
    // Only add AI response if we got something back
    if (webhookResponse) {
      const aiResponse = { 
        type: 'ai' as const, 
        content: webhookResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-4xl mx-auto px-4 pt-20 pb-10">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Ask questions about your studies</CardDescription>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="flex flex-col space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <div>{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] px-4 py-2 rounded-lg bg-muted text-foreground">
                      <div className="flex space-x-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-foreground/70 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter>
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send size={18} />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AI;
