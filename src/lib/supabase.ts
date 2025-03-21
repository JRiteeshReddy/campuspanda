
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// These will be automatically replaced with your Supabase project's credentials
// when connected through Lovable's Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const handleError = (error: Error | unknown) => {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error('Error:', error);
  toast.error(message);
  return message;
};
