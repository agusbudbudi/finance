export interface SimpleBudgetItem {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  amount: number;
  createdAt: string;
}

export interface SimpleBudgetStore {
  budgets: SimpleBudgetItem[];
  addBudget: (budget: SimpleBudgetItem) => Promise<void>;
  updateBudget: (id: string, updates: Partial<SimpleBudgetItem>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}
