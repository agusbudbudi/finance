export interface SimpleTransaction {
  id: string;
  type: "expense" | "income";
  date: string; // ISO date string YYYY-MM-DD
  fromBank: string; // For income, this can be empty or represent the source
  toBank?: string; // For expense, optional transfer. For income, the receiving bank.
  amount: number;
  category: string;
  subCategory: string;
  description: string;
  fromCC: boolean; // true = paid via credit card (expense only)
  creditCardName?: string; // which CC if fromCC is true
  createdAt: string;
}

export interface SimpleModeConfig {
  banks: string[];
  creditCards: string[];
  categories: Record<string, string[]>;
  incomeCategories: Record<string, string[]>;
}

export interface SimpleTransactionFilters {
  startDate: string;
  endDate: string;
  fromSource: string;
  toSource: string;
  category: string;
  fromCC: boolean | null;
}

export interface SimpleTransactionStore {
  transactions: SimpleTransaction[];
  filters: SimpleTransactionFilters;
  addTransaction: (tx: SimpleTransaction) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<SimpleTransaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionsByMonth: (month: string) => SimpleTransaction[];
  getTransactionsByDate: (date: string) => SimpleTransaction[];
  setFilters: (filters: Partial<SimpleTransactionFilters>) => void;
  resetFilters: () => void;
  applyFilters: (tx: SimpleTransaction) => boolean;
}
