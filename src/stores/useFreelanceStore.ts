import { create } from "zustand";
import {
  FreelanceIncome,
  FreelanceStore,
  FreelanceAllocation,
} from "../types/freelance";
import { StorageService } from "../services/storage/storageService";

export const useFreelanceStore = create<FreelanceStore>((set, get) => ({
  incomes: StorageService.get<FreelanceIncome[]>("freelanceIncome") || [],

  setIncomes: (incomes: FreelanceIncome[]) => {
    StorageService.set("freelanceIncome", incomes);
    set({ incomes });
  },

  addIncome: (income: FreelanceIncome) => {
    const updated = [income, ...get().incomes];
    StorageService.set("freelanceIncome", updated);
    set({ incomes: updated });
  },

  allocateIncome: (incomeId: string, allocations: FreelanceAllocation[]) => {
    const updated = get().incomes.map((income) =>
      income.id === incomeId
        ? { ...income, allocations, status: "allocated" as const }
        : income,
    );
    StorageService.set("freelanceIncome", updated);
    set({ incomes: updated });
  },

  deleteIncome: (id: string) => {
    const updated = get().incomes.filter((income) => income.id !== id);
    StorageService.set("freelanceIncome", updated);
    set({ incomes: updated });
  },

  getTotalIncome: () => {
    return get().incomes.reduce((sum, income) => sum + income.amount, 0);
  },
}));
