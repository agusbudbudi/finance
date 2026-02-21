import { create } from "zustand";
import {
  FreelanceIncome,
  FreelanceStore,
  FreelanceAllocation,
} from "../types/freelance";
import { StorageService } from "../services/storage/storageService";
import { useBudgetStore } from "./useBudgetStore";

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

    // Sync with budget
    const month = income.date.slice(0, 7);
    const monthTotal = updated
      .filter((i: FreelanceIncome) => i.date.startsWith(month))
      .reduce((sum: number, i: FreelanceIncome) => sum + i.amount, 0);
    useBudgetStore.getState().syncFreelanceIncome(month, monthTotal);
  },

  allocateIncome: (incomeId: string, allocations: FreelanceAllocation[]) => {
    const updated = get().incomes.map((income: FreelanceIncome) =>
      income.id === incomeId
        ? { ...income, allocations, status: "allocated" as const }
        : income,
    );
    StorageService.set("freelanceIncome", updated);
    set({ incomes: updated });
  },

  deleteIncome: (id: string) => {
    const income = get().incomes.find((i: FreelanceIncome) => i.id === id);
    if (!income) return;

    const updated = get().incomes.filter((income: FreelanceIncome) => income.id !== id);
    StorageService.set("freelanceIncome", updated);
    set({ incomes: updated });

    // Sync with budget
    const month = income.date.slice(0, 7);
    const monthTotal = updated
      .filter((i: FreelanceIncome) => i.date.startsWith(month))
      .reduce((sum: number, i: FreelanceIncome) => sum + i.amount, 0);
    useBudgetStore.getState().syncFreelanceIncome(month, monthTotal);
  },

  getTotalIncome: () => {
    return get().incomes.reduce((sum: number, income: FreelanceIncome) => sum + income.amount, 0);
  },
}));
