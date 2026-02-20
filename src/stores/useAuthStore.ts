import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabase/supabaseClient";

interface AuthState {
  // Identity (Supabase)
  user: User | null;
  session: Session | null;
  
  // Privacy (Client-side Encryption)
  masterPassword: string | null;
  isUnlocked: boolean;

  // Actions
  setAuth: (user: User | null, session: Session | null) => void;
  setMasterPassword: (password: string) => void;
  signOut: () => Promise<void>;
  lock: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      masterPassword: null,
      isUnlocked: false,

      setAuth: (user, session) => set({ user, session }),
      
      setMasterPassword: (password: string) => set({ masterPassword: password, isUnlocked: true }),

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, masterPassword: null, isUnlocked: false });
      },

      lock: () => set({ masterPassword: null, isUnlocked: false }),
    }),
    {
      name: "auth-storage",
      partialize: () => ({}), // Don't persist ANY sensitive data across refreshes
    }
  )
);

// Listen for auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setAuth(session?.user ?? null, session ?? null);
});
