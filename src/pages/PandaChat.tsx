
import React from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const PandaChat = () => {
  useDocumentTitle();

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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-2xl font-semibold mb-2">Coming Soon!</h3>
              <p className="text-muted-foreground">
                Our AI chatbot is currently under maintenance. Please check back later!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PandaChat;
