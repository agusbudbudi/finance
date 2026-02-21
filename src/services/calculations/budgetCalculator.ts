import { Allocation, MonthlyBudget } from "../../types/budget";

export class BudgetCalculator {
  /**
   * Calculate allocation completion percentage
   */
  static getAllocationProgress(allocations: Allocation[]): number {
    if (allocations.length === 0) return 0;

    const completed = allocations.filter((a) => a.isCompleted).length;
    return (completed / allocations.length) * 100;
  }

  /**
   * Calculate total allocated amount
   */
  static getTotalAllocated(allocations: Allocation[]): number {
    return allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  }

  /**
   * Calculate remaining amount
   */
  static getRemaining(income: number, allocations: Allocation[]): number {
    const allocated = this.getTotalAllocated(allocations);
    return income - allocated;
  }

  /**
   * Calculate savings rate
   */
  static getSavingsRate(income: number, expenses: number): number {
    if (income === 0) return 0;
    return (income - expenses) / income;
  }

  /**
   * Validate allocation (total shouldn't exceed income)
   */
  static validateAllocation(
    income: number,
    allocations: Allocation[],
  ): { valid: boolean; message?: string } {
    const total = this.getTotalAllocated(allocations);

    if (total > income) {
      return {
        valid: false,
        message: `Total allocation (${total.toLocaleString()}) exceeds income (${income.toLocaleString()})`,
      };
    }

    return { valid: true };
  }

  /**
   * Generate default allocations based on profile
   */
  static generateDefaultAllocations(
    salary: number,
    familyAmount: number = 0,
  ): Allocation[] {
    return [
      {
        id: crypto.randomUUID(),
        category: "family_support",
        amount: familyAmount,
        toAccount: "acc_003",
        isCompleted: false,
        completedAt: null,
      },
      {
        id: crypto.randomUUID(),
        category: "daily_spending",
        amount: Math.round(salary * 0.25),
        toAccount: "acc_002",
        isCompleted: false,
        completedAt: null,
      },
      {
        id: crypto.randomUUID(),
        category: "savings",
        amount: Math.round(salary * 0.35),
        toAccount: "acc_001",
        isCompleted: false,
        completedAt: null,
      },
      {
        id: crypto.randomUUID(),
        category: "investment",
        amount: Math.round(salary * 0.15),
        toAccount: "acc_006",
        isCompleted: false,
        completedAt: null,
      },
      {
        id: crypto.randomUUID(),
        category: "emergency_fund",
        amount: Math.round(salary * 0.1),
        toAccount: "acc_005",
        isCompleted: false,
        completedAt: null,
      },
      {
        id: crypto.randomUUID(),
        category: "ovo_topup",
        amount: 500000,
        toAccount: "acc_007",
        isCompleted: false,
        completedAt: null,
      },
      {
        id: crypto.randomUUID(),
        category: "credit_card_buffer",
        amount: 500000,
        toAccount: "acc_001",
        isCompleted: false,
        completedAt: null,
      },
    ];
  }

  /**
   * Calculate budget summary
   */
  static calculateSummary(
    budget: MonthlyBudget,
    totalSpentOverride?: number,
  ): MonthlyBudget["summary"] {
    const totalAllocated = this.getTotalAllocated(budget.allocations);
    const totalSpent =
      totalSpentOverride !== undefined
        ? totalSpentOverride
        : Object.values(budget.expenses).reduce(
            (sum, expense) => sum + expense.spent,
            0,
          );

    return {
      totalIncome: budget.income.total,
      totalAllocated,
      totalSpent,
      remaining: budget.income.total - totalAllocated - totalSpent,
      savingsRate: this.getSavingsRate(budget.income.total, totalSpent),
    };
  }
}
