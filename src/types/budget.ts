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
  setBudgets: (budgets: MonthlyBudget[]) => Promise<void>;
  setCurrentBudget: (budget: MonthlyBudget) => void;
  addBudget: (budget: MonthlyBudget) => Promise<void>;
  updateBudget: (id: string, updates: Partial<MonthlyBudget>) => Promise<void>;
  updateAllocation: (
    budgetId: string,
    allocationId: string,
    updates: Partial<Allocation>,
  ) => Promise<void>;
  addAllocation: (budgetId: string, allocation: Allocation) => Promise<void>;
  deleteAllocation: (budgetId: string, allocationId: string) => Promise<void>;
  completeAllocation: (budgetId: string, allocationId: string) => Promise<void>;
  getBudgetByMonth: (month: string) => MonthlyBudget | undefined;
  ensureMonthExists: (month: string) => Promise<MonthlyBudget>;
  duplicateAllocationsFromMonth: (
    sourceMonth: string,
    targetMonth: string,
  ) => Promise<void>;
  syncExpenses: (month: string, expenses: any[]) => Promise<void>;
  syncFreelanceIncome: (month: string, amount: number) => Promise<void>;
}
