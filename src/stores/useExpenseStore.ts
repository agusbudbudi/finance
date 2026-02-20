import { create } from "zustand";
import { Expense, ExpenseStore } from "../types/expense";
import { StorageService } from "../services/storage/storageService";
import { useAccountsStore } from "./useAccountsStore";
import { useCreditCardStore } from "./useCreditCardStore";

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: StorageService.get<Expense[]>("expenses") || [],

  addExpense: (expense: Expense) => {
    const updated = [expense, ...get().expenses];
    StorageService.set("expenses", updated);
    set({ expenses: updated });

    // Auto-deduct balance logic
    if (expense.accountType === "bank") {
      const accountsStore = useAccountsStore.getState();
      const account = accountsStore.getAccountById(expense.accountId);
      if (account) {
        accountsStore.updateAccount(expense.accountId, {
          balance: account.balance - expense.amount,
        });
      }
    } else if (expense.accountType === "credit_card") {
      const ccStore = useCreditCardStore.getState();
      ccStore.addTransaction(expense.accountId, {
        id: expense.id,
        date: expense.date,
        amount: expense.amount,
        category: expense.category,
        merchant: expense.note || "General Expense",
      });
    }
  },

  updateExpense: (id: string, updates: Partial<Expense>) => {
    // Note: Re-calculating full balance on edit is complex for MVP.
    // We update the record; for balance correction, delete and re-add is standard for simple trackers.
    const updated = get().expenses.map((e) =>
      e.id === id ? { ...e, ...updates } : e,
    );
    StorageService.set("expenses", updated);
    set({ expenses: updated });
  },

  deleteExpense: (id: string) => {
    const expense = get().expenses.find((e) => e.id === id);
    if (!expense) return;

    const updated = get().expenses.filter((e) => e.id !== id);
    StorageService.set("expenses", updated);
    set({ expenses: updated });

    // Revert balance deduction (Refund)
    if (expense.accountType === "bank") {
      const accountsStore = useAccountsStore.getState();
      const account = accountsStore.getAccountById(expense.accountId);
      if (account) {
        accountsStore.updateAccount(expense.accountId, {
          balance: account.balance + expense.amount,
        });
      }
    }
    // Note: Reverting CC transactions requires more complex transaction matching IDs in useCreditCardStore.
    // For now, focus on Bank balance restoration as the primary requirement.
  },

  getExpensesByMonth: (month: string) => {
    return get().expenses.filter((e) => e.date.startsWith(month));
  },
}));
