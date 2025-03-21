
import { Database as OriginalDatabase } from '@/integrations/supabase/types';

// Extend the original Database type to include our subjects table
export interface Database extends OriginalDatabase {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          classes_attended: number;
          classes_conducted: number;
          required_percentage: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          classes_attended?: number;
          classes_conducted?: number;
          required_percentage?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          classes_attended?: number;
          classes_conducted?: number;
          required_percentage?: number;
          created_at?: string;
        };
      };
    } & OriginalDatabase['public']['Tables'];
    Views: OriginalDatabase['public']['Views'];
    Functions: OriginalDatabase['public']['Functions'];
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
}
