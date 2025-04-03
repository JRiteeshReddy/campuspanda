
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading }) => {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary/10">
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-700 text-white text-xs">AI</AvatarFallback>
        </Avatar>
      )}
      <div 
        className={cn(
          "rounded-xl px-4 py-3 max-w-[80%] break-words",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
          isLoading ? "animate-pulse" : ""
        )}
      >
        {message.content}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gray-200 dark:bg-gray-800 text-xs">You</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
