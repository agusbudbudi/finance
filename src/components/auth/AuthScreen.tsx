import React, { useState } from "react";
import { supabase } from "../../services/supabase/supabaseClient";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  { icon: TrendingUp, label: "Wealth Growth Tracking" },
  { icon: ShieldCheck, label: "Encrypted Vault Security" },
  { icon: CheckCircle2, label: "Supabase Cloud Sync" },
];

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setMessage("Check your email for the confirmation link!");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-stretch z-[9999] overflow-hidden">
      {/* Left panel — brand / decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 flex-col items-center justify-center p-12 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -right-24 w-[28rem] h-[28rem] bg-indigo-800/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-primary-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-white text-center space-y-12 max-w-sm">
          {/* Logo mark */}
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto backdrop-blur-md border border-white/20 shadow-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-tight">
              FinanceOS
            </h1>
            <p className="text-blue-100/80 font-medium leading-relaxed">
              Your complete personal finance system. Private, encrypted, and
              always in sync.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4 text-left">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/90 font-semibold text-sm">{label}</span>
              </div>
            ))}
          </div>

          {/* Bottom tagline */}
          <p className="text-[11px] text-blue-200/60 font-medium uppercase tracking-widest">
            Secure · Private · Always Yours
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              FinanceOS
            </span>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {isLogin
                ? "Sign in to access your secure financial vault."
                : "Start managing your finances securely today."}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <p>{error}</p>
            </div>
          )}
          {message && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl flex items-start gap-3 text-emerald-700 dark:text-emerald-400 text-sm">
              <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
              <p>{message}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 dark:text-white focus:border-primary-500 focus:ring-0 outline-none transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 dark:text-white focus:border-primary-500 focus:ring-0 outline-none transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-xl font-black text-sm shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isLogin ? (
                <LogIn size={18} />
              ) : (
                <UserPlus size={18} />
              )}
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="text-primary-500 hover:text-primary-600 font-bold text-sm transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign Up →"
                : "Already have an account? Sign In →"}
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 font-medium">
            Secured by Supabase · Encrypted Vault · v1.2
          </p>
        </div>
      </div>
    </div>
  );
};
