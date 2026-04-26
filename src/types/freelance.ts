export interface FreelanceAllocation {
  id: string;
  category: "savings" | "spending" | "investment";
  amount: number;
  toAccount: string;
  isCompleted: boolean;
}

export interface FreelanceIncome {
  id: string;
  date: string;
  category: "Freelance" | "Bonus" | "THR" | "Other";
  client: string;
  project: string;
  amount: number;
  receivedAt: string;
  toAccount: string;
  allocations: FreelanceAllocation[];
  status: "pending" | "allocated" | "completed";
}

export interface FreelanceStore {
  incomes: FreelanceIncome[];
  setIncomes: (incomes: FreelanceIncome[]) => Promise<void>;
  addIncome: (income: FreelanceIncome) => Promise<void>;
  allocateIncome: (
    incomeId: string,
    allocations: FreelanceAllocation[],
  ) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  getTotalIncome: () => number;
}
