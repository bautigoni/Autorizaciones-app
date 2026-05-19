export type Role = 'family' | 'preceptor' | 'secretary';

export type AuthStatus =
  | 'pending'
  | 'approved'
  | 'observed'
  | 'rejected'
  | 'completed'
  | 'expired'
  | 'cancelled';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  phone?: string | null;
  avatar_color?: string | null;
}

export interface Student {
  id: number;
  full_name: string;
  dni: string;
  level: string; // Inicial / Primario / Secundario
  course: string; // e.g. "3°B"
  birthdate?: string | null;
  avatar_color?: string | null;
}

export interface Guardian {
  id: number;
  user_id: number;
  student_id: number;
  relation: string; // madre / padre / tutor
}

export interface AuthorizedAdult {
  id: number;
  family_user_id: number; // who registered them
  full_name: string;
  dni: string;
  relation: string;
  phone?: string | null;
}

export interface Authorization {
  id: number;
  code: string; // human readable, e.g. NE-0421
  student_id: number;
  created_by_user_id: number;
  pickup_adult_name: string;
  pickup_adult_dni: string;
  pickup_adult_relation?: string | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  reason: string;
  notes?: string | null;
  status: AuthStatus;
  reviewed_by_user_id?: number | null;
  reviewed_at?: string | null;
  withdrawn_at?: string | null;
  withdrawn_by_user_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface AuthHistoryEntry {
  id: number;
  authorization_id: number;
  actor_user_id: number;
  action: string; // created | approved | rejected | observed | edited | cancelled | withdrawn | note_added
  from_status?: AuthStatus | null;
  to_status?: AuthStatus | null;
  comment?: string | null;
  created_at: string;
}

export interface Attachment {
  id: number;
  authorization_id: number;
  filename: string;
  mime: string;
  size: number;
  created_at: string;
}

// Expanded / joined types returned by API
export interface AuthorizationFull extends Authorization {
  student: Student;
  created_by: Pick<User, 'id' | 'full_name' | 'email' | 'role'>;
  reviewed_by?: Pick<User, 'id' | 'full_name' | 'role'> | null;
  withdrawn_by?: Pick<User, 'id' | 'full_name' | 'role'> | null;
  history: AuthHistoryEntry[];
  attachments: Attachment[];
}

export interface DashboardMetrics {
  pending: number;
  approved: number;
  observed: number;
  rejected: number;
  completed: number;
  expired: number;
  todayTotal: number;
}

export interface AppNotification {
  id: number;
  user_id: number;
  type: 'auth_approved' | 'auth_rejected' | 'auth_observed' | 'auth_completed' | 'auth_pending' | 'auth_cancelled' | 'info';
  title: string;
  body: string | null;
  authorization_id: number | null;
  read: boolean;
  created_at: string;
}
