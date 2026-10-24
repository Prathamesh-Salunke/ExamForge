import { supabase, isSupabaseConfigured } from './supabaseClient';
import { AuthUser, SignUpParams, SignInParams } from './types';

const LOCAL_USERS_KEY = 'examforge_auth_users_v2';
const LOCAL_SESSION_KEY = 'examforge_auth_session_v2';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'faculty' | 'evaluator';
  createdAt: string;
}

/**
 * Computes SHA-256 hash for secure client-side password handling.
 */
async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_examforge_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback string hash
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return 'fallback_' + Math.abs(hash).toString(16);
}

/**
 * Initializes default institutional accounts for demonstration.
 */
async function initLocalUsers(): Promise<StoredUser[]> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read users from storage', e);
  }

  // Pre-seed default Evaluator / Professor account
  const defaultHash = await hashPassword('Admin@2026');
  const defaultUsers: StoredUser[] = [
    {
      id: 'usr-prof-01',
      name: 'Prof. H. R. Deshmukh',
      email: 'professor@examforge.edu',
      passwordHash: defaultHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-eval-02',
      name: 'Dr. Vivek Salunke (Exam Controller)',
      email: 'controller@examforge.edu',
      passwordHash: defaultHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ];

  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaultUsers));
  } catch (e) {
    console.warn('Could not save default users', e);
  }

  return defaultUsers;
}

export const authService = {
  isUsingSupabase(): boolean {
    return isSupabaseConfigured;
  },

  async getInitialSession(): Promise<AuthUser | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) return null;
        const u = data.session.user;
        return {
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
          role: 'admin',
          createdAt: u.created_at,
        };
      } catch (err) {
        console.warn('Supabase getSession failed, falling back to local session', err);
      }
    }

    // Local session lookup
    try {
      const stored =
        localStorage.getItem(LOCAL_SESSION_KEY) ||
        sessionStorage.getItem(LOCAL_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored) as AuthUser;
      }
    } catch {
      return null;
    }

    return null;
  },

  async signUp({ name, email, password }: SignUpParams): Promise<{ user: AuthUser | null; error: string | null }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { user: null, error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { user: null, error: 'Password must be at least 6 characters.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: cleanName },
          },
        });

        if (error) {
          return { user: null, error: error.message };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: cleanName,
            role: 'admin',
            createdAt: data.user.created_at,
          };
          return { user: authUser, error: null };
        }
      } catch (err: unknown) {
        return { user: null, error: (err as Error).message || 'Signup failed with Supabase.' };
      }
    }

    // Local institutional signup
    const users = await initLocalUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { user: null, error: 'An account with this email address already exists.' };
    }

    const passwordHash = await hashPassword(password);
    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    // Auto log in new user
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(authUser));

    return { user: authUser, error: null };
  },

  async signIn({ email, password, rememberMe = true }: SignInParams): Promise<{ user: AuthUser | null; error: string | null }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { user: null, error: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { user: null, error: 'Please enter your password.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return { user: null, error: error.message };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            role: 'admin',
            createdAt: data.user.created_at,
          };
          return { user: authUser, error: null };
        }
      } catch (err: unknown) {
        return { user: null, error: (err as Error).message || 'Authentication failed.' };
      }
    }

    // Local institutional sign-in
    const users = await initLocalUsers();
    const userMatch = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!userMatch) {
      return {
        user: null,
        error: 'No account registered with this email. (Tip: Use demo account "professor@examforge.edu")',
      };
    }

    const testHash = await hashPassword(password);
    if (userMatch.passwordHash !== testHash) {
      return { user: null, error: 'Incorrect password. Please verify and try again.' };
    }

    const authUser: AuthUser = {
      id: userMatch.id,
      email: userMatch.email,
      name: userMatch.name,
      role: userMatch.role,
      createdAt: userMatch.createdAt,
    };

    if (rememberMe) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(authUser));
      sessionStorage.removeItem(LOCAL_SESSION_KEY);
    } else {
      sessionStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(authUser));
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }

    return { user: authUser, error: null };
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error', e);
      }
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
  },

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const redirectUrl = window.location.origin + window.location.pathname;
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });
        if (error) return { success: false, error: error.message };
        return { success: true, error: null };
      } catch (err: unknown) {
        return { success: false, error: (err as Error).message || 'Reset failed.' };
      }
    }

    // Local reset check
    const users = await initLocalUsers();
    const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);

    if (!exists) {
      return {
        success: false,
        error: 'No registered user found with this email in ExamForge.',
      };
    }

    return { success: true, error: null };
  },
};
