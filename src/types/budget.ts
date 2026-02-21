export type AllocationCategory =
  | "family_support"
  | "daily_spending"
  | "savings"
  | "investment"
  | "emergency_fund"
  | "ovo_topup"
  | "credit_card_buffer"
  | "deposito"
  | "lifestyle_buffer"
  | "other";

export interface Allocation {
  id: string;
  name: string;
  category: AllocationCategory;
  amount: number;
  toAccount: string;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface ExpenseCategory {
  budget: number;
  spent: number;
}

export interface MonthlyBudget {
  id: string;
  month: string; // Format: YYYY-MM
  income: {
    salary: number;
    freelance: number;
    other: number;
    total: number;
  };
  allocations: Allocation[];
  expenses: Record<string, ExpenseCategory>;
  summary: {
    totalIncome: number;
    totalAllocated: number;
    totalSpent: number;
    remaining: number;
    savingsRate: number;
  };
}

export interface BudgetStore {
  budgets: MonthlyBudget[];
  currentBudget: MonthlyBudget | null;
  setBudgets: (budgets: MonthlyBudget[]) => void;
  setCurrentBudget: (budget: MonthlyBudget) => void;
  addBudget: (budget: MonthlyBudget) => void;
  updateBudget: (id: string, updates: Partial<MonthlyBudget>) => void;
  updateAllocation: (
    budgetId: string,
    allocationId: string,
    updates: Partial<Allocation>,
  ) => void;
  addAllocation: (budgetId: string, allocation: Allocation) => void;
  deleteAllocation: (budgetId: string, allocationId: string) => void;
  completeAllocation: (budgetId: string, allocationId: string) => void;
  getBudgetByMonth: (month: string) => MonthlyBudget | undefined;
  ensureMonthExists: (month: string) => MonthlyBudget;
  duplicateAllocationsFromMonth: (
    sourceMonth: string,
    targetMonth: string,
  ) => void;
  syncExpenses: (month: string, expenses: any[]) => void;
  syncFreelanceIncome: (month: string, amount: number) => void;
}
