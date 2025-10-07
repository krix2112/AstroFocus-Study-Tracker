import { isSupabaseConfigured } from "../lib/supabaseClient";

export default function Login() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {!isSupabaseConfigured && (
          <div className="text-red-400 text-sm">
            Missing Supabase env vars. Add <code>.env</code> with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
          </div>
        )}
        <button
          onClick={() => {}}
          className="bg-white/10 px-4 py-2 rounded hover:bg-white/20 disabled:opacity-50"
          disabled={!isSupabaseConfigured}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}


