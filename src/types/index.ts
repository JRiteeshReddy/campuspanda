
export interface User {
  id: string;
  email: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  classes_attended: number;
  classes_conducted: number;
  required_percentage: number;
  created_at: string;
}

export interface SubjectForm {
  name: string;
  classes_attended: number;
  classes_conducted: number;
  required_percentage: number;
}

export interface AuthFormData {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
}

export interface AttendanceSuggestion {
  type: 'attend' | 'bunk';
  count: number;
}

export interface Assignment {
  id: string;
  user_id: string;
  subject: string;
  title: string;
  deadline: Date;
  completed: boolean;
  created_at: string;
}

export interface AssignmentForm {
  subject: string;
  title: string;
  deadline: Date;
}

export interface Note {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  file_type: string;
  file_url?: string;
  link_url?: string;
  created_at: string;
}

export interface NoteWithSubject extends Note {
  subject: Subject;
}

export interface NoteForm {
  subject_id: string;
  title: string;
  file_type: string;
  file?: File;
  link_url?: string;
}

export interface SubjectWithNotesCount extends Subject {
  notesCount: number;
}
