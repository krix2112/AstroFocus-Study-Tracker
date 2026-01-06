import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export interface User {
  id: string;
  roll_no: string;
  student_name?: string;
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
      if (!supabase) {
        setLoading(false);
        return;
      }

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
      return { success: false, error: "Database not configured. Please check your Supabase settings." };
    }

    if (!rollNo.trim()) {
      return { success: false, error: "Registration number is required" };
    }

    try {
      // Check if user exists in the database
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("roll_no", rollNo.trim())
        .single();

      // If user doesn't exist, don't create them - ask to contact admin
      if (fetchError) {
        // If it's a "not found" error (PGRST116), user doesn't exist
        if (fetchError.code === 'PGRST116' || fetchError.message?.includes('No rows')) {
          return { 
            success: false, 
            error: "This registration number is not registered. Please contact the admin to get access to the app." 
          };
        } else {
          // Real error occurred
          console.error("Fetch error:", fetchError);
          return { 
            success: false, 
            error: `Database error: ${fetchError.message || fetchError.code || "Failed to fetch user"}. Please check your database connection.` 
          };
        }
      }

      // User exists, sign them in
      if (!existingUser) {
        return { 
          success: false, 
          error: "This registration number is not registered. Please contact the admin to get access to the app." 
        };
      }

      // Store user in state and localStorage
      setUser(existingUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingUser));
      
      return { success: true };
    } catch (error: any) {
      console.error("Sign in error:", error);
      const errorMessage = error?.message || error?.toString() || "An unexpected error occurred";
      
      // Check for network errors
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
        return { 
          success: false, 
          error: "Network error: Unable to connect to database. Please check your internet connection and Supabase configuration." 
        };
      }
      
      return { success: false, error: errorMessage };
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


