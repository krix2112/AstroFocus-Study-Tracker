import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { VITE_SUPABASE_URL as FALLBACK_URL, VITE_SUPABASE_ANON_KEY as FALLBACK_KEY } from "../env";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || FALLBACK_URL;
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || FALLBACK_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;


