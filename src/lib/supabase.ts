
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';

// Cast the client to use our extended Database type
export const supabase = supabaseClient as unknown as ReturnType<typeof supabaseClient<Database>>;

export const handleError = (error: Error | unknown) => {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error('Error:', error);
  toast.error(message);
  return message;
};
