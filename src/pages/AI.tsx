
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
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
    { 
      type: 'ai', 
      content: 'Hello! How can I help you with your studies today?', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Gemini API integration
  const sendMessageToGemini = async (message: string) => {
    setIsLoading(true);
    try {
      console.log('Sending message to Gemini API');
      
      // Using the correct Gemini API version (v1beta)
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBTE3kGyjn_YBZEkhjWbwYVYyi7jB44ky0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: message
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Gemini response:', data);
      
      // Extract the response text from the Gemini API response
      let aiResponse = '';
      if (data.candidates && 
          data.candidates[0] && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts[0]) {
        aiResponse = data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
      
      return aiResponse;
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      
      toast({
        title: 'AI Error',
        description: `Failed to get response: ${error.message}`,
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
    
    // Send to Gemini API and get response
    const aiResponse = await sendMessageToGemini(input.trim());
    
    // Only add AI response if we got something back
    if (aiResponse) {
      const aiMessage: Message = { 
        type: 'ai', 
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
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
                      className={`${
                        message.type === 'user' 
                          ? 'max-w-[80%] px-4 py-2 rounded-lg bg-primary text-primary-foreground' 
                          : 'max-w-[80%] px-4 py-2 rounded-lg bg-muted text-foreground'
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
