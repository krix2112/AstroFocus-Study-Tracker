import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export interface User {
  id: string;
  admission_no: string;
  registration_no: string;
  student_name: string;
  mobile: string;
  created_at?: string;
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithRegistrationAndMobile: (registrationNo: string, mobile: string) => Promise<{ success: boolean; error?: string }>;
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
            .eq("registration_no", userData.registration_no)
            .single();
          
          if (data && !error) {
            setUser(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } else {
            // Check if it's a network error
            if (error) {
              const errorMsg = error.message || error.toString() || "";
              if (errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch') || errorMsg.includes('network')) {
                console.error("Network error loading user:", error);
                // Keep user in localStorage but log the error
                // User can still use the app offline
              } else {
                // User not found or other error, clear storage
                localStorage.removeItem(STORAGE_KEY);
                setUser(null);
              }
            } else {
              // No data and no error - user not found
              localStorage.removeItem(STORAGE_KEY);
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        // On error, keep user in localStorage if it exists (offline mode)
        // Only clear if it's a parsing error
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            JSON.parse(stored); // Test if valid JSON
          } else {
            setUser(null);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signInWithRegistrationAndMobile = async (registrationNo: string, mobile: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Database not configured. Please check your Supabase settings." };
    }

    if (!registrationNo.trim()) {
      return { success: false, error: "Registration number is required" };
    }

    if (!mobile.trim()) {
      return { success: false, error: "Mobile number is required" };
    }

    try {
      // Check if user exists with matching registration number and mobile
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("registration_no", registrationNo.trim())
        .eq("mobile", mobile.trim())
        .single();

      // If user doesn't exist or credentials don't match
      if (fetchError) {
        // If it's a "not found" error (PGRST116), credentials don't match
        if (fetchError.code === 'PGRST116' || fetchError.message?.includes('No rows')) {
          return { 
            success: false, 
            error: "Invalid credentials. Please check your registration number and mobile number, or contact the admin if you need access." 
          };
        } else {
          // Check for network/fetch errors
          const errorMsg = fetchError.message || fetchError.toString() || "";
          const errorDetails = fetchError.details || "";
          
          // Check for DNS resolution errors (ERR_NAME_NOT_RESOLVED)
          if (errorDetails.includes('ERR_NAME_NOT_RESOLVED') || errorMsg.includes('ERR_NAME_NOT_RESOLVED') || errorDetails.includes('Failed to fetch')) {
            console.error("DNS/Connection error:", fetchError);
            return { 
              success: false, 
              error: "Cannot connect to database: The Supabase project URL cannot be resolved. This usually means: 1) The project was deleted or paused (check your Supabase dashboard), 2) The URL is incorrect, or 3) There's a network/DNS issue. Please verify your Supabase project is active and the URL is correct." 
            };
          }
          
          // Check for other network/fetch errors
          if (errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch') || errorMsg.includes('network') || fetchError.code === 'PGRST301') {
            console.error("Network error:", fetchError);
            return { 
              success: false, 
              error: "Network error: Unable to connect to database. Please check your internet connection and verify that the Supabase project is active in your dashboard." 
            };
          }
          
          // Other database errors
          console.error("Fetch error:", fetchError);
          return { 
            success: false, 
            error: `Database error: ${fetchError.message || fetchError.code || "Failed to fetch user"}. Please check your database connection.` 
          };
        }
      }

      // User exists and credentials match, sign them in
      if (!existingUser) {
        return { 
          success: false, 
          error: "Invalid credentials. Please check your registration number and mobile number." 
        };
      }

      // Store user in state and localStorage
      setUser(existingUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingUser));
      
      return { success: true };
    } catch (error: any) {
      console.error("Sign in error:", error);
      const errorMessage = error?.message || error?.toString() || "An unexpected error occurred";
      
      // Check for DNS resolution errors
      if (errorMessage.includes('ERR_NAME_NOT_RESOLVED') || errorMessage.includes('Failed to fetch')) {
        return { 
          success: false, 
          error: "Cannot connect to database: The Supabase project URL cannot be resolved. Please check: 1) Your Supabase project is active (not paused/deleted), 2) The URL in src/env.ts is correct, 3) Your internet connection is working." 
        };
      }
      
      // Check for other network errors
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
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
    <AuthContext.Provider value={{ user, loading, signInWithRegistrationAndMobile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}


