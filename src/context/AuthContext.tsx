"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Role } from "@/config/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  role: Role | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  logout: async () => {},
  loginWithGoogle: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      // Priority 0: Client-side dummy session
      if (typeof window !== 'undefined') {
        const dummyUserStr = localStorage.getItem('dummy_user');
        if (dummyUserStr) {
          try {
            const dummyUser = JSON.parse(dummyUserStr);
            setUser(dummyUser);
            setRole(dummyUser.user_metadata.role);
            setLoading(false);
            return;
          } catch (e) {
            // fallback
          }
        }
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchRole(session.user);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // If dummy user is present, ignore Supabase session changes
        if (typeof window !== 'undefined' && localStorage.getItem('dummy_user')) {
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await fetchRole(session.user);
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRole = async (user: User) => {
    // Priority 1: Tactical Metadata (Direct from Seeding/Auth)
    if (user.user_metadata?.role) {
      setRole(user.user_metadata.role as Role);
      return;
    }

    // Priority 2: Database Fallback
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (data && data.role) {
        setRole(data.role as Role);
      } else {
        setRole("employee");
      }
    } catch (error) {
      setRole("employee");
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to log in with Google");
    }
  };

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dummy_user');
      }
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      router.push("/login");
    } catch (error) {
      setUser(null);
      setRole(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
