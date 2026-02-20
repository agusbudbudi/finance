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
  setIncomes: (incomes: FreelanceIncome[]) => void;
  addIncome: (income: FreelanceIncome) => void;
  allocateIncome: (
    incomeId: string,
    allocations: FreelanceAllocation[],
  ) => void;
  deleteIncome: (id: string) => void;
  getTotalIncome: () => number;
}
