import { create } from "zustand";
import { Account, AccountsStore } from "../types/account";
import { StorageService } from "../services/storage/storageService";

export const useAccountsStore = create<AccountsStore>((set, get) => ({
  accounts: StorageService.get<Account[]>("accounts") || [],

  setAccounts: (accounts: Account[]) => {
    StorageService.set("accounts", accounts);
    set({ accounts });
  },

  addAccount: (account: Account) => {
    let updated = get().accounts;
    if (account.isSalaryAccount) {
      updated = updated.map((acc) => ({ ...acc, isSalaryAccount: false }));
    }
    updated = [...updated, account];
    StorageService.set("accounts", updated);
    set({ accounts: updated });
  },

  updateAccount: (id: string, updates: Partial<Account>) => {
    let updated = get().accounts;
    if (updates.isSalaryAccount) {
      updated = updated.map((acc) => ({ ...acc, isSalaryAccount: false }));
    }
    updated = updated.map((acc) =>
      acc.id === id ? { ...acc, ...updates } : acc,
    );
    StorageService.set("accounts", updated);
    set({ accounts: updated });
  },

  deleteAccount: (id: string) => {
    const updated = get().accounts.filter((acc) => acc.id !== id);
    StorageService.set("accounts", updated);
    set({ accounts: updated });
  },

  getAccountById: (id: string) => {
    return get().accounts.find((acc) => acc.id === id);
  },
}));
