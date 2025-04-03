export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assignments: {
        Row: {
          completed: boolean
          created_at: string
          deadline: string
          id: string
          subject: string
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          deadline: string
          id?: string
          subject: string
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          deadline?: string
          id?: string
          subject?: string
          title?: string
          user_id?: string
        }
      }
      event_links: {
        Row: {
          category: string
          created_at: string
          id: string
          title: string
          url: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          title: string
          url: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      event_notices: {
        Row: {
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      event_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          due_date: string | null
          id: string
          name: string
          priority: string
          status: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          name: string
          priority: string
          status?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          name?: string
          priority?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      event_teams: {
        Row: {
          created_at: string
          events: Json
          id: string
          members: Json
          name: string
          team_lead: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: Json
          id?: string
          members?: Json
          name: string
          team_lead?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          events?: Json
          id?: string
          members?: Json
          name?: string
          team_lead?: string | null
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          created_at: string
          file_type: string
          file_url: string | null
          id: string
          link_url: string | null
          subject_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_type: string
          file_url?: string | null
          id?: string
          link_url?: string | null
          subject_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_type?: string
          file_url?: string | null
          id?: string
          link_url?: string | null
          subject_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          classes_attended: number
          classes_conducted: number
          created_at: string
          id: string
          name: string
          required_percentage: number
          user_id: string
        }
        Insert: {
          classes_attended?: number
          classes_conducted?: number
          created_at?: string
          id?: string
          name: string
          required_percentage?: number
          user_id: string
        }
        Update: {
          classes_attended?: number
          classes_conducted?: number
          created_at?: string
          id?: string
          name?: string
          required_percentage?: number
          user_id?: string
        }
        Relationships: []
      }
      timetable: {
        Row: {
          created_at: string
          day_of_week: string
          end_time: string
          id: string
          location: string | null
          notes: string | null
          start_time: string
          subject_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: string
          end_time: string
          id?: string
          location?: string | null
          notes?: string | null
          start_time: string
          subject_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: string
          end_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          start_time?: string
          subject_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
