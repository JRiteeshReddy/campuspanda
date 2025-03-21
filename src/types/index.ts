
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
