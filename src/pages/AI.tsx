
import { useState } from 'react';
import { toast } from '@/hooks/use-toast'; // Updated import path to use our hook
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Message = {
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
};

const AI = () => {
  // Default webhook URL - would be replaced with env variable in production
  const webhookUrl = 'http://localhost:5678/webhook-test/063c029b-45b7-4a00-8cdc-e5f0bcabe152';
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      type: 'ai', 
      content: 'Hello! How can I help you with your studies today?', 
      timestamp: new Date() 
    },
    { 
      type: 'system', 
      content: 'Note: This AI feature requires a local webhook server running at ' + webhookUrl + '. Please ensure it\'s active before sending messages.', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const sendMessageToWebhook = async (message: string) => {
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      console.log('Sending request to webhook:', webhookUrl);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response received:', data);
      
      if (!data || !data.output) {
        throw new Error('Invalid response format from webhook');
      }
      
      return data.output;
    } catch (error: any) {
      console.error('Error calling webhook:', error);
      
      // Set a more helpful error message based on the error type
      if (error.message === 'Failed to fetch') {
        setConnectionError(
          'Unable to connect to the webhook. Please ensure your local webhook server is running at ' +
          webhookUrl + ' and accessible from your browser.'
        );
      } else {
        setConnectionError(`Error: ${error.message}`);
      }
      
      toast({
        title: 'Connection Error',
        description: 'Failed to get response from the AI webhook.',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = { 
      type: 'user', 
      content: input.trim(), 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Send to webhook and get response
    const webhookResponse = await sendMessageToWebhook(input.trim());
    
    // Only add AI response if we got something back
    if (webhookResponse) {
      const aiResponse: Message = { 
        type: 'ai', 
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
            {connectionError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{connectionError}</AlertDescription>
              </Alert>
            )}
            
            <ScrollArea className="h-[60vh] pr-4">
              <div className="flex flex-col space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${
                      message.type === 'user' 
                        ? 'justify-end' 
                        : message.type === 'system'
                          ? 'justify-center'
                          : 'justify-start'
                    }`}
                  >
                    <div 
                      className={`${
                        message.type === 'user' 
                          ? 'max-w-[80%] px-4 py-2 rounded-lg bg-primary text-primary-foreground' 
                          : message.type === 'system'
                            ? 'max-w-[90%] px-4 py-2 rounded-lg bg-muted/50 text-muted-foreground text-xs italic'
                            : 'max-w-[80%] px-4 py-2 rounded-lg bg-muted text-foreground'
                      }`}
                    >
                      <div>{message.content}</div>
                      {message.type !== 'system' && (
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      )}
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
