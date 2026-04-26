import { create } from "zustand";
import { SimpleBudgetItem, SimpleBudgetStore } from "../types/simpleBudget";
import { StorageService } from "../services/storage/storageService";

export const useSimpleBudgetStore = create<SimpleBudgetStore>((set, get) => ({
  budgets: StorageService.get<SimpleBudgetItem[]>("simpleBudgets") || [],

  addBudget: async (budget: SimpleBudgetItem) => {
    const updated = [...get().budgets, budget];
    await StorageService.set("simpleBudgets", updated);
    set({ budgets: updated });
  },

  updateBudget: async (id: string, updates: Partial<SimpleBudgetItem>) => {
    const updated = get().budgets.map((b) =>
      b.id === id ? { ...b, ...updates } : b
    );
    await StorageService.set("simpleBudgets", updated);
    set({ budgets: updated });
  },

  deleteBudget: async (id: string) => {
    const updated = get().budgets.filter((b) => b.id !== id);
    await StorageService.set("simpleBudgets", updated);
    set({ budgets: updated });
  },
}));
