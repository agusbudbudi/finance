export const BANKS = [
  "BCA",
  "Mandiri",
  "BRI",
  "BNI",
  "SeaBank",
  "Permata",
  "OVO",
  "GoPay",
  "Dana",
] as const;

export const EXPENSE_CATEGORIES = [
  "food",
  "transport",
  "utilities",
  "entertainment",
  "shopping",
  "health",
  "education",
  "other",
] as const;

export const ALLOCATION_CATEGORIES = [
  "family_support",
  "daily_spending",
  "savings",
  "investment",
  "emergency_fund",
  "ovo_topup",
  "credit_card_buffer",
  "deposito",
  "lifestyle_buffer",
  "other",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  family_support: "Family Support",
  daily_spending: "Daily Spending",
  savings: "Savings",
  investment: "Investment",
  emergency_fund: "Emergency Fund",
  ovo_topup: "OVO Top-up",
  credit_card_buffer: "Credit Card Buffer",
  deposito: "Deposito",
  lifestyle_buffer: "Lifestyle / Buffer",
  other: "Other",
  food: "Food & Dining",
  transport: "Transportation",
  utilities: "Utilities",
  entertainment: "Entertainment",
  shopping: "Shopping",
  health: "Health",
  education: "Education",
};

export const COLORS = {
  primary: "#0ea5e9",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
};
export const MONTHS = [
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
  "2026-10",
  "2026-11",
  "2026-12",
];
