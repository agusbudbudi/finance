import { create } from "zustand";
import { MonthlyBudget, Allocation, BudgetStore } from "../types/budget";
import { StorageService } from "../services/storage/storageService";
import { BudgetCalculator } from "../services/calculations/budgetCalculator";

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  budgets: StorageService.get<MonthlyBudget[]>("monthlyBudgets") || [],
  currentBudget: null,

  setBudgets: (budgets: MonthlyBudget[]) => {
    StorageService.set("monthlyBudgets", budgets);
    set({ budgets });
  },

  setCurrentBudget: (budget: MonthlyBudget) => {
    set({ currentBudget: budget });
  },

  addBudget: (budget: MonthlyBudget) => {
    const budgets = [...get().budgets, budget];
    StorageService.set("monthlyBudgets", budgets);
    set({ budgets });
  },

  updateBudget: (id: string, updates: Partial<MonthlyBudget>) => {
    const budgets = get().budgets.map((budget) => {
      if (budget.id === id) {
        const updated = { ...budget, ...updates };
        // Recalculate summary
        updated.summary = BudgetCalculator.calculateSummary(updated);
        return updated;
      }
      return budget;
    });

    StorageService.set("monthlyBudgets", budgets);
    set({ budgets });

    // Update current budget if it's the one being updated
    if (get().currentBudget?.id === id) {
      const updated = budgets.find((b) => b.id === id);
      if (updated) set({ currentBudget: updated });
    }
  },

  updateAllocation: (
    budgetId: string,
    allocationId: string,
    updates: Partial<Allocation>,
  ) => {
    const budgets = get().budgets.map((budget) => {
      if (budget.id === budgetId) {
        const allocations = budget.allocations.map((alloc) =>
          alloc.id === allocationId ? { ...alloc, ...updates } : alloc,
        );
        const updated = { ...budget, allocations };
        updated.summary = BudgetCalculator.calculateSummary(updated);
        return updated;
      }
      return budget;
    });

    set({ budgets });
    StorageService.set("monthlyBudgets", budgets);

    if (get().currentBudget?.id === budgetId) {
      const updated = budgets.find((b) => b.id === budgetId);
      if (updated) set({ currentBudget: updated });
    }
  },

  addAllocation: (budgetId: string, allocation: Allocation) => {
    const budgets = get().budgets.map((budget) => {
      if (budget.id === budgetId) {
        const updated = {
          ...budget,
          allocations: [...budget.allocations, allocation],
        };
        updated.summary = BudgetCalculator.calculateSummary(updated);
        return updated;
      }
      return budget;
    });

    set({ budgets });
    StorageService.set("monthlyBudgets", budgets);

    if (get().currentBudget?.id === budgetId) {
      const updated = budgets.find((b) => b.id === budgetId);
      if (updated) set({ currentBudget: updated });
    }
  },

  deleteAllocation: (budgetId: string, allocationId: string) => {
    const budgets = get().budgets.map((budget) => {
      if (budget.id === budgetId) {
        const updated = {
          ...budget,
          allocations: budget.allocations.filter((a) => a.id !== allocationId),
        };
        updated.summary = BudgetCalculator.calculateSummary(updated);
        return updated;
      }
      return budget;
    });

    set({ budgets });
    StorageService.set("monthlyBudgets", budgets);

    if (get().currentBudget?.id === budgetId) {
      const updated = budgets.find((b) => b.id === budgetId);
      if (updated) set({ currentBudget: updated });
    }
  },

  completeAllocation: (budgetId: string, allocationId: string) => {
    get().updateAllocation(budgetId, allocationId, {
      isCompleted: true,
      completedAt: new Date().toISOString(),
    });
  },

  getBudgetByMonth: (month: string) => {
    return get().budgets.find((b) => b.month === month);
  },

  ensureMonthExists: (month: string) => {
    const existing = get().getBudgetByMonth(month);
    if (existing) return existing;

    // Create a new budget for the month
    const profile = StorageService.get<any>("profile");
    const salary = profile?.monthlySalary || 13000000;

    const newBudget: MonthlyBudget = {
      id: `budget_${month.replace("-", "_")}`,
      month,
      income: {
        salary,
        freelance: 0,
        other: 0,
        total: salary,
      },
      allocations: [],
      expenses: {
        food: { budget: 3000000, spent: 0 },
        transport: { budget: 1000000, spent: 0 },
        utilities: { budget: 1000000, spent: 0 },
        shopping: { budget: 1000000, spent: 0 },
        entertainment: { budget: 500000, spent: 0 },
        other: { budget: 500000, spent: 0 },
      },
      summary: {
        totalIncome: salary,
        totalAllocated: 0,
        totalSpent: 0,
        remaining: salary,
        savingsRate: 0,
      },
    };
    newBudget.summary = BudgetCalculator.calculateSummary(newBudget);

    get().addBudget(newBudget);
    return newBudget;
  },

  duplicateAllocationsFromMonth: (sourceMonth: string, targetMonth: string) => {
    const sourceBudget = get().getBudgetByMonth(sourceMonth);
    const targetBudget = get().getBudgetByMonth(targetMonth);

    if (!sourceBudget || !targetBudget) return;
    if (sourceBudget.allocations.length === 0) return;

    // Create copies of allocations with new IDs and reset completion status
    const newAllocations = sourceBudget.allocations.map((alloc) => ({
      ...alloc,
      id: crypto.randomUUID(),
      isCompleted: false,
      completedAt: null,
    }));

    // Add all new allocations to the target budget
    const updatedBudget = {
      ...targetBudget,
      allocations: [...targetBudget.allocations, ...newAllocations],
    };
    updatedBudget.summary = BudgetCalculator.calculateSummary(updatedBudget);

    const budgets = get().budgets.map((b) =>
      b.id === targetBudget.id ? updatedBudget : b,
    );

    StorageService.set("monthlyBudgets", budgets);
    set({ budgets });

    if (get().currentBudget?.id === targetBudget.id) {
      set({ currentBudget: updatedBudget });
    }
  },
}));
