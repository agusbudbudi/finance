import { StorageService } from "./storage/storageService";
import { Profile } from "../types/profile";
import { Account } from "../types/account";
import { CreditCard } from "../types/creditCard";
import { Investment } from "../types/investment";
import { MonthlyBudget } from "../types/budget";
import { BudgetCalculator } from "./calculations/budgetCalculator";
import { getCurrentMonth } from "../utils/formatters";

export class DataInitService {
  static initializeIfEmpty() {
    if (StorageService.has("profile")) return;

    console.log("Initializing seed data...");

    // 1. Profile
    const profile: Profile = {
      userId: "user_001",
      name: "Agud Budiman",
      monthlySalary: 13000000,
      salaryBank: "BCA",
      salaryDay: 25,
      currency: "IDR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Accounts
    const accounts: Account[] = [
      {
        id: "acc_001",
        name: "BCA Main (Salary)",
        bank: "BCA",
        type: "savings",
        purpose: "salary_savings",
        balance: 5000000,
        isActive: true,
      },
      {
        id: "acc_002",
        name: "Mandiri (Daily)",
        bank: "Mandiri",
        type: "checking",
        purpose: "daily_spending",
        balance: 2000000,
        isActive: true,
      },
      {
        id: "acc_003",
        name: "Mandiri 2 (Family)",
        bank: "Mandiri",
        type: "savings",
        purpose: "family_allocation",
        balance: 1000000,
        isActive: true,
      },
      {
        id: "acc_004",
        name: "BRI (Freelance)",
        bank: "BRI",
        type: "checking",
        purpose: "freelance",
        balance: 0,
        isActive: true,
      },
      {
        id: "acc_005",
        name: "SeaBank (Deposit)",
        bank: "SeaBank",
        type: "deposit",
        purpose: "emergency_fund",
        balance: 10000000,
        isActive: true,
      },
      {
        id: "acc_006",
        name: "Permata RDN",
        bank: "Permata",
        type: "investment",
        purpose: "investment",
        balance: 0,
        isActive: true,
      },
      {
        id: "acc_007",
        name: "OVO",
        bank: "OVO",
        type: "ewallet",
        purpose: "daily_spending",
        balance: 500000,
        isActive: true,
      },
    ];

    // 3. Credit Card
    const creditCards: CreditCard[] = [
      {
        id: "cc_001",
        bank: "Mandiri",
        cardName: "Mandiri Credit Card",
        lastFourDigits: "8888",
        creditLimit: 15000000,
        billingCycle: { statementDate: 20, dueDate: 10 },
        statements: [],
        currentMonth: {
          spent: 0,
          availableCredit: 15000000,
          utilizationRate: 0,
        },
      },
    ];

    // 4. Investment
    const investments: Investment = {
      startMonth: "2026-02",
      monthlyContribution: 2000000,
      estimatedAnnualReturn: 0.12,
      contributions: [],
      summary: {
        totalContributed: 0,
        estimatedValue: 0,
        estimatedReturn: 0,
        returnRate: 0,
      },
      projections: [],
    };

    // 5. Initial Budget (current month)
    const currentMonth = getCurrentMonth();
    const defaultAllocations = BudgetCalculator.generateDefaultAllocations(
      profile.monthlySalary,
      1000000,
    );
    const initialBudget: MonthlyBudget = {
      id: `budget_${currentMonth.replace("-", "_")}`,
      month: currentMonth,
      income: { salary: 13000000, freelance: 0, other: 0, total: 13000000 },
      allocations: defaultAllocations,
      expenses: {
        food: { budget: 3000000, spent: 0 },
        transport: { budget: 1000000, spent: 0 },
        utilities: { budget: 1000000, spent: 0 },
        shopping: { budget: 1000000, spent: 0 },
        entertainment: { budget: 500000, spent: 0 },
        other: { budget: 500000, spent: 0 },
      },
      summary: {
        totalIncome: 13000000,
        totalAllocated: BudgetCalculator.getTotalAllocated(defaultAllocations),
        totalSpent: 0,
        remaining: 0,
        savingsRate: 0,
      },
    };
    initialBudget.summary = BudgetCalculator.calculateSummary(initialBudget);

    // Save all to LocalStorage
    StorageService.set("profile", profile);
    StorageService.set("accounts", accounts);
    StorageService.set("creditCards", creditCards);
    StorageService.set("investments", investments);
    StorageService.set("monthlyBudgets", [initialBudget]);
    StorageService.set("freelanceIncome", []);

    // Set a flag to indicate first run
    StorageService.set("app_initialized", true);

    console.log("Seed data initialized successfully.");
  }
}
