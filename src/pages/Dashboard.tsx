import { Plus, Zap } from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";
import { BalanceHero } from "../components/dashboard/BalanceHero";
import { DashboardMetricGrid } from "../components/dashboard/DashboardMetricGrid";
import { UpcomingBillsList } from "../components/dashboard/UpcomingBillsList";
import { SpendingAnalyticsChart } from "../components/dashboard/SpendingAnalyticsChart";
import { SystemInsightCards } from "../components/dashboard/SystemInsightCards";

export const Dashboard = () => {
  const {
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
  } = useDashboardData();

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Central Balance Display */}
      <BalanceHero
        totalBalance={totalBalance}
        activeBucketsCount={accounts.length}
      />

      {/* Summary Diagnostic Widgets */}
      <DashboardMetricGrid
        budgetUtilization={budgetUtilization}
        monthlyExpenses={monthlyExpenses}
        ccUtilization={ccUtilization}
        totalCCSpent={totalCCSpent}
        investmentGrowth={investmentGrowth}
        savingsRate={savingsRate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upcoming Recurring Payments */}
        <UpcomingBillsList unpostedRecurring={unpostedRecurring} />

        {/* Analytics Section */}
        <SpendingAnalyticsChart
          expenseData={expenseData}
          monthlyExpenses={monthlyExpenses}
          budgetLimit={budgetLimit}
          hasBudget={!!currentBudget}
        />
      </div>

      {/* Smart System Insights */}
      <SystemInsightCards insights={insights} profile={profile || undefined} />

      {/* Floating Action Menu */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <button className="btn btn-primary px-8 py-4 rounded-full shadow-2xl shadow-primary-500/40 border-4 border-white dark:border-gray-900 flex items-center gap-3 active:scale-95 transition-all">
          <div className="p-1 bg-white/20 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-base font-bold">Quick Log</span>
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
