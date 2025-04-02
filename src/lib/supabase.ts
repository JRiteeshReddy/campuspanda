
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

// Helper function to get unique categories from links
export const fetchUniqueCategories = async (userId: string): Promise<string[]> => {
  try {
    // Use the correct type from our extended Database type
    const { data, error } = await supabase
      .from('event_links')
      .select('category')
      .eq('user_id', userId)
      .order('category');
      
    if (error) throw error;
    
    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return categories;
  } catch (error) {
    handleError(error);
    return [];
  }
};
