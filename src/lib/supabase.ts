
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Export the supabase client from the integration
export const supabase = supabaseClient;

export const handleError = (error: Error | unknown) => {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error('Error:', error);
  toast.error(message);
  return message;
};
