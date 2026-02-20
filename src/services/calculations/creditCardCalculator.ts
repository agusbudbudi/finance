import { CreditCardTransaction } from "../../types/creditCard";

export class CreditCardCalculator {
  /**
   * Calculate current utilization rate
   */
  static getUtilizationRate(spent: number, limit: number): number {
    if (limit === 0) return 0;
    return spent / limit;
  }

  /**
   * Calculate available credit
   */
  static getAvailableCredit(limit: number, spent: number): number {
    return Math.max(0, limit - spent);
  }

  /**
   * Calculate days until due date
   */
  static getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if payment is overdue
   */
  static isOverdue(dueDate: string, isPaid: boolean): boolean {
    if (isPaid) return false;
    return this.getDaysUntilDue(dueDate) < 0;
  }

  /**
   * Get next statement date
   */
  static getNextStatementDate(statementDay: number): Date {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    let nextStatement = new Date(year, month, statementDay);

    // If statement day has passed this month, get next month
    if (today.getDate() > statementDay) {
      nextStatement = new Date(year, month + 1, statementDay);
    }

    return nextStatement;
  }

  /**
   * Get next due date
   */
  static getNextDueDate(dueDay: number): Date {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    let nextDue = new Date(year, month + 1, dueDay);

    // Adjust if needed
    if (today.getDate() > dueDay && today.getMonth() === month) {
      nextDue = new Date(year, month + 2, dueDay);
    }

    return nextDue;
  }

  /**
   * Calculate total spent in current billing cycle
   */
  static getCurrentCycleSpent(
    transactions: CreditCardTransaction[],
    lastStatementDate: string,
  ): number {
    const lastStatement = new Date(lastStatementDate);

    return transactions
      .filter((tx) => new Date(tx.date) > lastStatement)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  /**
   * Get spending by category
   */
  static getSpendingByCategory(
    transactions: CreditCardTransaction[],
  ): Record<string, number> {
    return transactions.reduce(
      (acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Get utilization status
   */
  static getUtilizationStatus(rate: number): {
    status: "low" | "medium" | "high" | "critical";
    message: string;
  } {
    if (rate < 0.3) {
      return { status: "low", message: "Healthy utilization" };
    } else if (rate < 0.5) {
      return { status: "medium", message: "Moderate utilization" };
    } else if (rate < 0.7) {
      return {
        status: "high",
        message: "High utilization - consider paying down",
      };
    } else {
      return { status: "critical", message: "Critical - pay down immediately" };
    }
  }
}
