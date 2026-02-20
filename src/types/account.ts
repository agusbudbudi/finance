export type AccountType =
  | "savings"
  | "checking"
  | "deposit"
  | "investment"
  | "ewallet";
export type AccountPurpose =
  | "salary_savings"
  | "daily_spending"
  | "family_allocation"
  | "freelance"
  | "emergency_fund"
  | "investment";

export interface Account {
  id: string;
  name: string;
  bank: string;
  type: AccountType;
  purpose: AccountPurpose;
  balance: number;
  isActive: boolean;
  isSalaryAccount?: boolean;
}

export interface AccountsStore {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  getAccountById: (id: string) => Account | undefined;
}
