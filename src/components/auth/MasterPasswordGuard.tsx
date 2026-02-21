import React, { useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { Lock, Unlock, ShieldAlert, Loader2, ShieldCheck, Cloud, TrendingUp } from "lucide-react";
import { CloudSyncService } from "../../services/supabase/cloudSyncService";
import { SupabaseStorageService } from "../../services/supabase/supabaseStorageService";
import { StorageService } from "../../services/storage/storageService";
import { rehydrateStores } from "../../services/storage/storeHydration";

const VAULT_FEATURES = [
  { icon: ShieldCheck, label: "AES-256 Client-Side Encryption" },
  { icon: Cloud, label: "Supabase Cloud Backup" },
  { icon: TrendingUp, label: "Full Financial History" },
];

export const MasterPasswordGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isUnlocked, setMasterPassword, user, signOut } = useAuthStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(true);
      return;
    }

    setIsSyncing(true);
    setError(false);
    try {
      const isValid = await SupabaseStorageService.verifyMasterPassword(password);
      if (!isValid) {
        setError(true);
        return;
      }
      await StorageService.unlockSession(password);
      rehydrateStores();
      setMasterPassword(password);
      const syncResult = await CloudSyncService.performInitialSync(password);
      if (syncResult.migrated.length > 0) {
        rehydrateStores();
      }
    } catch (err) {
      console.error("Initial sync/verification failed:", err);
      setError(true);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 flex items-stretch z-[9999] overflow-hidden">
      {/* Left panel — brand / decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 flex-col items-center justify-center p-12 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -right-24 w-[28rem] h-[28rem] bg-indigo-800/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-primary-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-white text-center space-y-12 max-w-sm">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto backdrop-blur-md border border-white/20 shadow-xl">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-tight">
              Vault Locked
            </h1>
            <p className="text-blue-100/80 font-medium leading-relaxed">
              Your data is encrypted and safe. Enter your Master Password to
              decrypt and sync your financial records.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {VAULT_FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/90 font-semibold text-sm">{label}</span>
              </div>
            ))}
          </div>

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
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              FinanceOS Vault
            </span>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Unlock Vault
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Enter your Master Password to decrypt and access your financial data.
            </p>
          </div>

          {/* Account session strip */}
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-white/5 rounded-xl border-2 border-gray-100 dark:border-white/10">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">
                Signed in as
              </span>
              <span className="text-gray-800 dark:text-white text-xs font-bold truncate leading-none">
                {user?.email}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 text-[10px] font-black uppercase tracking-wider rounded-xl border border-gray-100 dark:border-white/10 hover:border-red-100 dark:hover:border-red-900/30 transition-all"
            >
              Sign Out
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                Master Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 bg-white dark:bg-white/5 dark:text-white focus:border-primary-500 focus:ring-0 outline-none transition-all font-medium ${
                    error
                      ? "border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-900/10"
                      : "border-gray-100 dark:border-white/10"
                  }`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm flex items-center gap-1.5 ml-1 font-semibold">
                  <ShieldAlert size={14} />
                  {password.length < 6
                    ? "Password must be at least 6 characters."
                    : "Incorrect Master Password. Please try again."}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSyncing}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-xl font-black text-sm shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isSyncing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Unlock size={18} />
              )}
              {isSyncing ? "Syncing & Decrypting..." : "Unlock Vault"}
            </button>
          </form>

          {/* Warning */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl space-y-2">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-800 dark:text-amber-300 text-xs leading-relaxed font-medium">
                <strong>Penting:</strong> Password ini <strong>TIDAK BISA diganti</strong> dan tidak ada fitur "Lupa Password". Jika lupa, data di cloud tidak bisa dibuka selamanya.
              </p>
            </div>
            <p className="text-amber-700 dark:text-amber-400/80 text-[10px] leading-relaxed italic border-t border-amber-200 dark:border-amber-900/30 pt-2 text-center">
              This password <strong>CANNOT be changed</strong>. If lost, your encrypted data cannot be recovered.
            </p>
          </div>

          <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 font-medium">
            Secured by Supabase · AES-256 Encryption · v1.2
          </p>
        </div>
      </div>
    </div>
  );
};
