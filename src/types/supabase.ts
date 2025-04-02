import { Database as OriginalDatabase } from '@/integrations/supabase/types';

// Extend the original Database type to include our event tables
export interface Database extends OriginalDatabase {
  public: {
    Tables: {
      assignments: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          title: string;
          deadline: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          title: string;
          deadline: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          title?: string;
          deadline?: string;
          completed?: boolean;
          created_at?: string;
        };
      };
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
      event_notices: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          deadline: string | null;
          type: 'urgent' | 'upcoming' | 'general';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          deadline?: string | null;
          type: 'urgent' | 'upcoming' | 'general';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          deadline?: string | null;
          type?: 'urgent' | 'upcoming' | 'general';
          created_at?: string;
        };
      };
      event_tasks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          assigned_to: string | null;
          due_date: string | null;
          priority: 'Low' | 'Medium' | 'High';
          status: 'Pending' | 'In Progress' | 'Completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          assigned_to?: string | null;
          due_date?: string | null;
          priority: 'Low' | 'Medium' | 'High';
          status?: 'Pending' | 'In Progress' | 'Completed';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          assigned_to?: string | null;
          due_date?: string | null;
          priority?: 'Low' | 'Medium' | 'High';
          status?: 'Pending' | 'In Progress' | 'Completed';
          created_at?: string;
        };
      };
      event_teams: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          members: string[];
          events: string[];
          team_lead?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          members?: string[];
          events?: string[];
          team_lead?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          members?: string[];
          events?: string[];
          team_lead?: string;
          created_at?: string;
        };
      };
      event_links: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string;
          category?: string;
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
