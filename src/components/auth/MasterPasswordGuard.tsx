import React, { useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { Lock, Unlock, ShieldAlert, Loader2 } from "lucide-react";
import { CloudSyncService } from "../../services/supabase/cloudSyncService";
import { SupabaseStorageService } from "../../services/supabase/supabaseStorageService";
import { StorageService } from "../../services/storage/storageService";
import { rehydrateStores } from "../../services/storage/storeHydration";

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
      // Step 1: Verify the password against Supabase
      const isValid = await SupabaseStorageService.verifyMasterPassword(password);
      
      if (!isValid) {
        setError(true);
        return;
      }

      // Step 2: Unlock physical session (decrypt local storage into memory)
      await StorageService.unlockSession(password);

      // Step 3: Hydrate all reactive stores with decrypted data
      rehydrateStores();

      // Step 4: Set the password in store (UI unlock)
      setMasterPassword(password);
      
      // Step 5: Trigger initial sync (bidirectional)
      const syncResult = await CloudSyncService.performInitialSync(password);
      
      // Step 6: If data was pulled from cloud, rehydrate stores again
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
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-4 bg-indigo-100 rounded-full text-indigo-600">
            <Lock size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Vault Locked</h1>
          <p className="text-slate-500 text-sm">
            Enter your Master Password to decrypt your financial data.
          </p>
        </div>

        {/* User Session Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Account</span>
            <span className="text-slate-700 text-xs font-bold truncate leading-none">{user?.email}</span>
          </div>
          <button 
            onClick={() => signOut()}
            className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 text-[10px] font-black uppercase tracking-wider rounded-xl border border-slate-200 hover:border-red-100 transition-all shadow-sm"
          >
            Sign Out
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Master Password"
              className={`w-full px-4 py-3 rounded-xl border ${
                error ? "border-red-500 bg-red-50" : "border-slate-200 focus:border-indigo-500"
              } outline-none transition-all`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <ShieldAlert size={14} /> 
                {password.length < 6 ? "Password must be at least 6 characters." : "Incorrect Master Password."}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSyncing}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <Unlock size={20} />}
            {isSyncing ? "Syncing Data..." : "Unlock Vault"}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100">
          <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl space-y-2">
            <p className="text-amber-800 text-xs leading-relaxed">
              <strong>Penting:</strong> Gunakan password yang gampang diingat. Password ini <strong>TIDAK BISA diganti</strong> dan tidak ada fitur "Lupa Password". Jika lupa, data di cloud tidak akan bisa dibuka selamanya.
            </p>
            <p className="text-amber-700 text-[10px] leading-relaxed italic border-t border-amber-200 pt-2 text-center">
              <strong>Note:</strong> Use a password you won't forget. This password <strong>CANNOT be changed</strong>. If lost, your data cannot be recovered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
