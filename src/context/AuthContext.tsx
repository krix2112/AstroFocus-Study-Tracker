import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export interface User {
  id: string;
  roll_no: string;
  created_at?: string;
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithRollNo: (rollNo: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
export const useAuth = () => useContext(AuthContext!);

const STORAGE_KEY = "auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Load user from localStorage on mount
    const loadUser = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const userData = JSON.parse(stored);
          // Verify user still exists in database
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("roll_no", userData.roll_no)
            .single();
          
          if (data && !error) {
            setUser(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } else {
            // User not found, clear storage
            localStorage.removeItem(STORAGE_KEY);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signInWithRollNo = async (rollNo: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Database not configured" };
    }

    if (!rollNo.trim()) {
      return { success: false, error: "Roll number is required" };
    }

    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("roll_no", rollNo.trim())
        .single();

      let userData: User;

      if (existingUser && !fetchError) {
        // User exists, sign them in
        userData = existingUser;
      } else {
        // User doesn't exist, create new user
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert([{ roll_no: rollNo.trim() }])
          .select()
          .single();

        if (insertError || !newUser) {
          return { success: false, error: insertError?.message || "Failed to create user" };
        }

        userData = newUser;
      }

      // Store user in state and localStorage
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      
      return { success: true };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { success: false, error: error.message || "An error occurred" };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("gradeCalculatorSubjects"); // Clear grade calculator data
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithRollNo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}


