import {
  InvestmentProjection,
  InvestmentContribution,
} from "../../types/investment";

export class InvestmentCalculator {
  /**
   * Calculate investment projections
   */
  static calculateProjections(
    startMonth: string,
    monthlyContribution: number,
    annualReturn: number,
    months: number = 12,
  ): InvestmentProjection[] {
    const projections: InvestmentProjection[] = [];
    const monthlyReturn = annualReturn / 12;

    let cumulativeValue = 0;
    const start = new Date(startMonth + "-01");

    for (let i = 0; i < months; i++) {
      const currentMonth = new Date(start);
      currentMonth.setMonth(start.getMonth() + i);

      // Add monthly contribution
      cumulativeValue += monthlyContribution;

      // Apply monthly return
      cumulativeValue *= 1 + monthlyReturn;

      const monthStr = currentMonth.toISOString().slice(0, 7);

      projections.push({
        month: monthStr,
        contribution: monthlyContribution,
        cumulativeContribution: monthlyContribution * (i + 1),
        estimatedValue: Math.round(cumulativeValue),
      });
    }

    return projections;
  }

  /**
   * Calculate total contributed amount
   */
  static getTotalContributed(contributions: InvestmentContribution[]): number {
    return contributions.reduce((sum, c) => sum + c.amount, 0);
  }

  /**
   * Calculate estimated current value
   */
  static getEstimatedValue(
    contributions: InvestmentContribution[],
    annualReturn: number,
  ): number {
    const monthlyReturn = annualReturn / 12;
    const now = new Date();

    return contributions.reduce((total, contribution) => {
      const contributionDate = new Date(contribution.contributedAt);
      const monthsElapsed = this.getMonthsDifference(contributionDate, now);

      // Compound the contribution
      const value =
        contribution.amount * Math.pow(1 + monthlyReturn, monthsElapsed);
      return total + value;
    }, 0);
  }

  /**
   * Calculate months between two dates
   */
  private static getMonthsDifference(start: Date, end: Date): number {
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return Math.max(0, months);
  }

  /**
   * Calculate return rate
   */
  static getReturnRate(totalContributed: number, currentValue: number): number {
    if (totalContributed === 0) return 0;
    return (currentValue - totalContributed) / totalContributed;
  }

  /**
   * Calculate estimated return amount
   */
  static getEstimatedReturn(
    totalContributed: number,
    currentValue: number,
  ): number {
    return currentValue - totalContributed;
  }

  /**
   * Project future value
   */
  static projectFutureValue(
    currentValue: number,
    monthlyContribution: number,
    annualReturn: number,
    months: number,
  ): number {
    const monthlyReturn = annualReturn / 12;
    let futureValue = currentValue;

    for (let i = 0; i < months; i++) {
      futureValue = (futureValue + monthlyContribution) * (1 + monthlyReturn);
    }

    return Math.round(futureValue);
  }
}
