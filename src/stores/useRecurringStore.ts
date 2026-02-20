import { create } from "zustand";
import { RecurringTransaction, RecurringStore } from "../types/recurring";
import { StorageService } from "../services/storage/storageService";
import { useExpenseStore } from "./useExpenseStore";

export const useRecurringStore = create<RecurringStore>((set, get) => ({
  subscriptions:
    StorageService.get<RecurringTransaction[]>("recurring_tx")?.map((s) => ({
      ...s,
      month: s.month || new Date().toISOString().slice(0, 7),
    })) || [],

  addSubscription: (sub: RecurringTransaction) => {
    const updated = [...get().subscriptions, sub];
    StorageService.set("recurring_tx", updated);
    set({ subscriptions: updated });
  },

  updateSubscription: (id: string, updates: Partial<RecurringTransaction>) => {
    const updated = get().subscriptions.map((s) =>
      s.id === id ? { ...s, ...updates } : s,
    );
    StorageService.set("recurring_tx", updated);
    set({ subscriptions: updated });
  },

  deleteSubscription: (id: string) => {
    const updated = get().subscriptions.filter((s) => s.id !== id);
    StorageService.set("recurring_tx", updated);
    set({ subscriptions: updated });
  },

  duplicateFromMonth: (sourceMonth: string, targetMonth: string) => {
    const sourceSubs = get().subscriptions.filter(
      (s) => s.month === sourceMonth,
    );
    const newSubs = sourceSubs.map((s) => ({
      ...s,
      id: crypto.randomUUID(),
      month: targetMonth,
      lastPosted: undefined,
    }));

    const updated = [...get().subscriptions, ...newSubs];
    StorageService.set("recurring_tx", updated);
    set({ subscriptions: updated });
  },

  postTransaction: (id: string, month: string) => {
    const sub = get().subscriptions.find((s) => s.id === id);
    if (!sub) return;

    // 1. Create the expense entry
    const expenseStore = useExpenseStore.getState();
    expenseStore.addExpense({
      id: crypto.randomUUID(),
      date: `${month}-${sub.dueDay.toString().padStart(2, "0")}`,
      amount: sub.amount,
      category: sub.category as any,
      accountId: sub.accountId,
      accountType: sub.accountType,
      note: `Recurring: ${sub.name}`,
      createdAt: new Date().toISOString(),
    });

    // 2. Update the subscription's last posted date
    get().updateSubscription(id, { lastPosted: month });
  },
}));
