export const SCHEMA_VERSIONS = {
  profile: "1.0.0",
  accounts: "1.0.0",
  monthlyBudgets: "1.0.0",
  creditCards: "1.0.0",
  investments: "1.0.0",
  freelanceIncome: "1.0.0",
  settings: "1.0.0",
} as const;

export interface StorageSchema<T> {
  schema: string;
  version: string;
  data: T;
  updatedAt?: string;
}
