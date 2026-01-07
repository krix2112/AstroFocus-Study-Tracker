import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { isSupabaseConfigured } from "../lib/supabaseClient";

export default function Login() {
  const [registrationNo, setRegistrationNo] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const signInWithRegistrationAndMobile = auth?.signInWithRegistrationAndMobile;
  const navigate = useNavigate();

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '');
    setRegistrationNo(value);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '');
    setMobile(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!registrationNo.trim()) {
      setError("Please enter your registration number");
      return;
    }

    if (!mobile.trim()) {
      setError("Please enter your mobile number");
      return;
    }

    if (!signInWithRegistrationAndMobile) {
      setError("Authentication not available");
      return;
    }

    setLoading(true);

    // Combine J25 prefix with the entered registration number
    const fullRegistrationNo = `J25${registrationNo}`;
    const result = await signInWithRegistrationAndMobile(fullRegistrationNo, mobile.trim());
    
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
              Registration Number
            </label>
            <div className="flex items-center">
              <span className="bg-white/10 px-4 py-3 rounded-l border border-white/10 border-r-0 text-white font-semibold">
                J25
              </span>
              <input
                type="text"
                value={registrationNo}
                onChange={handleRegistrationChange}
                placeholder="Enter numbers only"
                maxLength={7}
                className="flex-1 bg-white/10 px-4 py-3 rounded-r outline-none text-white placeholder-slate-400 border border-white/10 focus:border-neonCyan transition"
                required
                disabled={loading || !isSupabaseConfigured}
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Format: J25 + your registration number (numbers only)
            </p>
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">
              Mobile Number
            </label>
            <input
              type="text"
              value={mobile}
              onChange={handleMobileChange}
              placeholder="Enter your mobile number"
              maxLength={10}
              className="w-full bg-white/10 px-4 py-3 rounded outline-none text-white placeholder-slate-400 border border-white/10 focus:border-neonCyan transition"
              required
              disabled={loading || !isSupabaseConfigured}
              pattern="[0-9]*"
              inputMode="numeric"
            />
            <p className="text-slate-400 text-xs mt-1">
              Enter the mobile number registered with your admission
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured || !registrationNo.trim() || !mobile.trim()}
            className="w-full px-6 py-3 rounded btn-neon hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-slate-400 text-xs mt-4 text-center">
          Enter your registration number and mobile number to continue. If your credentials don't match, please contact the admin.
        </p>
      </div>
    </div>
  );
}


