import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { isSupabaseConfigured } from "../lib/supabaseClient";

export default function Login() {
  const [rollNo, setRollNo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithRollNo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signInWithRollNo(rollNo);
    
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Failed to sign in");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-md w-full">
        <h2 className="text-3xl font-bold gradient-text mb-6 text-center">
          CosmoStudy Login
        </h2>
        
        {!isSupabaseConfigured && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded mb-4 text-sm">
            Missing Supabase configuration. Please configure your database.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-2">
              Roll Number
            </label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="Enter your roll number"
              className="w-full bg-white/10 px-4 py-3 rounded outline-none text-white placeholder-slate-400 border border-white/10 focus:border-neonCyan transition"
              required
              disabled={loading || !isSupabaseConfigured}
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured || !rollNo.trim()}
            className="w-full px-6 py-3 rounded btn-neon hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In / Sign Up"}
          </button>
        </form>

        <p className="text-slate-400 text-xs mt-4 text-center">
          Enter your roll number to continue. If you're new, an account will be created automatically.
        </p>
      </div>
    </div>
  );
}


