import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { login as authLogin } from '../services/auth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.error("Auth init failed:", err);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // v16.5.0: Handle centralized 401 logout event
    const handleUnauthorized = () => {
        signOut();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
        subscription.unsubscribe();
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const login = async (email: string, password: string) => {
    const data = await authLogin(email, password);
    if (data.data.session) {
      const { data: { session }, error } = await supabase.auth.setSession({
        access_token: data.data.session.access_token,
        refresh_token: data.data.session.refresh_token || '',
      });
      if (error) throw error;

      // Force state update to prevent race condition during navigation
      if (session) {
        setSession(session);
        setUser(session.user);
      }
    }
  };

  const signOut = async () => {
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signInWithGoogle, login, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
