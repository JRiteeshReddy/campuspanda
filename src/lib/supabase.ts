
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';

// Cast the client to use our extended Database type
export const supabase = supabaseClient;

export const handleError = (error: Error | unknown) => {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error('Error:', error);
  toast.error(message);
  return message;
};

// Helper function to parse JSON from Supabase
export const parseJsonArray = (json: unknown): string[] => {
  if (Array.isArray(json)) {
    return json as string[];
  }
  
  try {
    const parsed = JSON.parse(json as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse JSON array:', e);
    return [];
  }
};
