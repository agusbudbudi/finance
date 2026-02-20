export type ExpenseCategory =
  | "Food & Drink"
  | "Transportation"
  | "Shopping"
  | "Utilities"
  | "Entertainment"
  | "Health"
  | "Investment"
  | "Other"
  | "family_support"
  | "daily_spending"
  | "savings"
  | "emergency_fund"
  | "ovo_topup"
  | "credit_card_buffer"
  | "deposito"
  | "lifestyle_buffer";

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  accountId: string; // Linked to Account ID or Credit Card ID
  accountType: "bank" | "credit_card";
  note: string;
  type?: "manual" | "allocation";
  createdAt: string;
}

export interface ExpenseStore {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByMonth: (month: string) => Expense[];
}
