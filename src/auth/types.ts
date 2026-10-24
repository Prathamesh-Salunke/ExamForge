export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'faculty' | 'evaluator';
  createdAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  authMode: 'SUPABASE' | 'INSTITUTIONAL';
  errorMessage: string | null;
}

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}
