export type RecurringFrequency = "monthly" | "yearly" | "weekly";

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: RecurringFrequency;
  dueDay: number; // 1-31
  accountId: string;
  accountType: "bank" | "credit_card";
  isActive: boolean;
  month: string; // YYYY-MM
  lastPosted?: string; // YYYY-MM
  note?: string;
}

export interface RecurringStore {
  subscriptions: RecurringTransaction[];
  addSubscription: (sub: RecurringTransaction) => Promise<void>;
  updateSubscription: (
    id: string,
    updates: Partial<RecurringTransaction>,
  ) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  postTransaction: (id: string, month: string) => Promise<void>;
  duplicateFromMonth: (sourceMonth: string, targetMonth: string) => Promise<void>;
}
