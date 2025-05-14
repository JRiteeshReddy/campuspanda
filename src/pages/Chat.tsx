
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Chat</h1>
        
        {!user ? (
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium mb-2">Please sign in</h2>
            <p className="text-muted-foreground mb-4">
              You need to sign in to access the chat functionality.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="bg-card rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">
              Chat functionality is coming soon. Stay tuned!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
