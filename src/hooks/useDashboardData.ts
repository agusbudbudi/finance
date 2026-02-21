import { useMemo } from "react";
import { useAccountsStore } from "../stores/useAccountsStore";
import { useBudgetStore } from "../stores/useBudgetStore";
import { useCreditCardStore } from "../stores/useCreditCardStore";
import { useFreelanceStore } from "../stores/useFreelanceStore";
import { useExpenseStore } from "../stores/useExpenseStore";
import { useInvestmentStore } from "../stores/useInvestmentStore";
import { useRecurringStore } from "../stores/useRecurringStore";
import { useProfileStore } from "../stores/useProfileStore";

export const useDashboardData = () => {
  const { accounts } = useAccountsStore();
  const { budgets } = useBudgetStore();
  const { cards } = useCreditCardStore();
  const { incomes } = useFreelanceStore();
  const { expenses } = useExpenseStore();
  const { investment } = useInvestmentStore();
  const { subscriptions } = useRecurringStore();
  const { profile } = useProfileStore();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentBudget = budgets.find((b) => b.month === currentMonth);

  // 1. Expense vs Budget
  const monthlyExpenses = useMemo(
    () =>
      expenses
        .filter((e) => e.date.startsWith(currentMonth))
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses, currentMonth],
  );

  const budgetLimit = useMemo(
    () =>
      Object.values(currentBudget?.expenses || {}).reduce(
        (sum, cat) => sum + (cat.budget || 0),
        0,
      ),
    [currentBudget],
  );

  const budgetUtilization =
    budgetLimit > 0 ? (monthlyExpenses / budgetLimit) * 100 : 0;

  // 2. Credit Card Usage
  const totalCCSpent = cards.reduce((sum, c) => sum + c.currentMonth.spent, 0);
  const totalCCLimit = cards.reduce((sum, c) => sum + c.creditLimit, 0);
  const ccUtilization =
    totalCCLimit > 0 ? (totalCCSpent / totalCCLimit) * 100 : 0;

  // 3. Investment Progress (12-month goal)
  const investedTotal = investment?.summary.totalContributed || 0;
  const projectedTotal = investment?.projections[11]?.estimatedValue || 0;
  const investmentGrowth =
    projectedTotal > 0 && investedTotal > 0
      ? ((projectedTotal - investedTotal) / investedTotal) * 100
      : 0;

  // 4. Savings Rate
  const totalMonthlyIncome = currentBudget?.summary.totalIncome || 0;
  const savingsRate =
    totalMonthlyIncome > 0
      ? ((totalMonthlyIncome - monthlyExpenses) / totalMonthlyIncome) * 100
      : 0;

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Spending Analytics Data (Last 6 months)
  const expenseData = [...budgets]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map((b) => ({
      name: new Date(b.month + "-01").toLocaleDateString("en-US", {
        month: "short",
      }),
      spent: b.summary.totalSpent,
      earned: b.summary.totalIncome,
    }));

  const unpostedRecurring = useMemo(() => {
    return subscriptions
      .filter((s) => s.month === currentMonth && s.lastPosted !== currentMonth)
      .sort((a, b) => a.dueDay - b.dueDay);
  }, [subscriptions, currentMonth]);

  const insights = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const salaryDay = profile?.salaryDay || 25;

    let daysToPayday = salaryDay - currentDay;
    if (daysToPayday <= 0) {
      daysToPayday = daysInMonth - currentDay + salaryDay;
    }

    const remainingBudget = budgetLimit - monthlyExpenses;
    const dailySafeSpend = Math.max(0, remainingBudget / daysToPayday);

    const emergencyBalance = accounts
      .filter((acc) => acc.purpose === "emergency_fund")
      .reduce((sum, acc) => sum + acc.balance, 0);
    const monthsBuffer =
      totalMonthlyIncome > 0 ? emergencyBalance / totalMonthlyIncome : 0;

    return {
      daysToPayday,
      dailySafeSpend,
      emergencyBalance,
      monthsBuffer,
    };
  }, [profile, budgetLimit, monthlyExpenses, accounts, totalMonthlyIncome]);

  return {
    accounts,
    currentBudget,
    monthlyExpenses,
    budgetLimit,
    budgetUtilization,
    totalCCSpent,
    ccUtilization,
    investmentGrowth,
    savingsRate,
    totalBalance,
    expenseData,
    unpostedRecurring,
    insights,
    profile,
    currentMonth,
  };
};
