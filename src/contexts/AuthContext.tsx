'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  email: string;
  display_name?: string;
  is_admin: boolean;
  push_subscription?: object;
  price_alert_enabled: boolean;
  price_alert_threshold: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  sessionError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  clearSessionError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const initializingRef = useRef(false);

  const isConfigured = supabase !== null;
  const isAdmin = profile?.is_admin ?? false;

  const clearSessionError = useCallback(() => {
    setSessionError(null);
  }, []);

  // Fetch user profile - simplified
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Profile fetch error:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const newProfile = await fetchProfile(user.id);
      setProfile(newProfile);
    }
  }, [user, fetchProfile]);

  // Clear all auth state
  const clearAuthState = useCallback(() => {
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  // Initialize auth state - simplified
  useEffect(() => {
    if (!supabase || initializingRef.current) {
      if (!supabase) setIsLoading(false);
      return;
    }

    initializingRef.current = true;
    const client = supabase;

    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await client.auth.getSession();

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);

          const userProfile = await fetchProfile(initialSession.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event, !!newSession);

        if (event === 'SIGNED_OUT') {
          clearAuthState();
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (newSession?.user) {
            setSession(newSession);
            setUser(newSession.user);
            const userProfile = await fetchProfile(newSession.user.id);
            setProfile(userProfile);
          }
          return;
        }

        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          if (!profile) {
            const userProfile = await fetchProfile(newSession.user.id);
            setProfile(userProfile);
          }
        } else if (!newSession) {
          clearAuthState();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, clearAuthState]);

  // Sign in with email/password - simplified
  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') };
    }

    setSessionError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      // Immediately set user and session
      if (data.session?.user) {
        setSession(data.session);
        setUser(data.session.user);
        const userProfile = await fetchProfile(data.session.user.id);
        setProfile(userProfile);
      }

      return { error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err as Error };
    }
  }, [fetchProfile]);

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  // Sign out - simplified
  const signOut = useCallback(async () => {
    if (!supabase) return;

    clearAuthState();

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }

    // Clear storage
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }, [clearAuthState]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') };
    }

    setSessionError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data: Partial<Profile>) => {
    if (!supabase || !user) {
      return { error: new Error('Not authenticated') };
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          display_name: data.display_name,
          price_alert_enabled: data.price_alert_enabled,
          price_alert_threshold: data.price_alert_threshold,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      await refreshProfile();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [user, refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        isLoading,
        isConfigured,
        sessionError,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        updateProfile,
        refreshProfile,
        clearSessionError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
