
import React from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import Navbar from '@/components/layout/Navbar';
import ChatbotContainer from '@/components/chatbot/ChatbotContainer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import FeedbackLink from '@/components/layout/FeedbackLink';

const Chatbot = () => {
  useDocumentTitle(); // Fixed: Removed the argument as the hook doesn't expect one
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-8 px-4">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center text-primary">
            PandaAI Chat
          </h1>
          
          {user ? (
            <ChatbotContainer />
          ) : (
            <div className="text-center py-16 max-w-lg mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Sign in to access PandaAI</h2>
              <p className="text-muted-foreground mb-8">
                You need to be logged in to use our AI assistant. Please sign in to continue.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button variant="outline" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <FeedbackLink />
    </div>
  );
};

export default Chatbot;
