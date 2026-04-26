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

  addSubscription: async (sub: RecurringTransaction) => {
    const updated = [...get().subscriptions, sub];
    await StorageService.set("recurring_tx", updated);
    set({ subscriptions: updated });
  },

  updateSubscription: async (id: string, updates: Partial<RecurringTransaction>) => {
    const updated = get().subscriptions.map((s) =>
      s.id === id ? { ...s, ...updates } : s,
    );
    await StorageService.set("recurring_tx", updated);
    set({ subscriptions: updated });
  },

  deleteSubscription: async (id: string) => {
    const updated = get().subscriptions.filter((s) => s.id !== id);
    await StorageService.set("recurring_tx", updated);
    set({ subscriptions: updated });
  },

  duplicateFromMonth: async (sourceMonth: string, targetMonth: string) => {
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
    await StorageService.set("recurring_tx", updated);
    set({ subscriptions: updated });
  },

  postTransaction: async (id: string, month: string) => {
    const sub = get().subscriptions.find((s) => s.id === id);
    if (!sub) return;

    // 1. Create the expense entry
    const expenseStore = useExpenseStore.getState();
    await expenseStore.addExpense({
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
    await get().updateSubscription(id, { lastPosted: month });
  },
}));
