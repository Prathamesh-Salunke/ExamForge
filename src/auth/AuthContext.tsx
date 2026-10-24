import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, SignInParams, SignUpParams } from './types';
import { authService } from './authService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authMode: 'SUPABASE' | 'INSTITUTIONAL';
  signIn: (params: SignInParams) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const authMode: 'SUPABASE' | 'INSTITUTIONAL' = isSupabaseConfigured
    ? 'SUPABASE'
    : 'INSTITUTIONAL';

  // Restore session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const initialUser = await authService.getInitialSession();
        if (isMounted) {
          setUser(initialUser);
        }
      } catch (err) {
        console.warn('Error reading initial auth session', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkSession();

    // Listen to Supabase Auth state changes if active
    let authListenerSubscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0] ||
              'User',
            role: 'admin',
            createdAt: session.user.created_at,
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
      authListenerSubscription = data.subscription;
    }

    return () => {
      isMounted = false;
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, []);

  const signIn = useCallback(async (params: SignInParams) => {
    setIsLoading(true);
    const { user: authedUser, error } = await authService.signIn(params);
    setIsLoading(false);
    if (error) {
      return { success: false, error };
    }
    setUser(authedUser);
    return { success: true };
  }, []);

  const signUp = useCallback(async (params: SignUpParams) => {
    setIsLoading(true);
    const { user: newUser, error } = await authService.signUp(params);
    setIsLoading(false);
    if (error) {
      return { success: false, error };
    }
    setUser(newUser);
    return { success: true };
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    await authService.signOut();
    setUser(null);
    setIsLoading(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { success, error } = await authService.resetPassword(email);
    return { success, error: error || undefined };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        authMode,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
