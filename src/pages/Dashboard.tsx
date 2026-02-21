import { useState } from "react";
import { Plus, Zap, FileSpreadsheet, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "../hooks/useDashboardData";
import { BalanceHero } from "../components/dashboard/BalanceHero";
import { DashboardMetricGrid } from "../components/dashboard/DashboardMetricGrid";
import { UpcomingBillsList } from "../components/dashboard/UpcomingBillsList";
import { SpendingAnalyticsChart } from "../components/dashboard/SpendingAnalyticsChart";
import { SystemInsightCards } from "../components/dashboard/SystemInsightCards";
import { QuickLogModal } from "../components/dashboard/QuickLogModal";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
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
    <div className="space-y-6 animate-in fade-in duration-700 pb-24">
      {/* Central Balance Display */}
      <BalanceHero
        totalBalance={totalBalance}
        activeBucketsCount={accounts.length}
      />

      {/* accounts.length === 0 && (
        <div 
          onClick={() => navigate('/settings', { state: { openExcelImport: true } })}
          className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Start Your Financial Journey</h3>
              <p className="text-sm text-gray-500 font-medium">Click here to quickly import your data from an Excel file.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-primary-600 font-bold text-sm bg-white dark:bg-black/20 px-4 py-2 rounded-lg shadow-sm border border-primary-100 dark:border-primary-900/10 group-hover:scale-105 transition-transform">
            Import Now
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      ) */}

      {/* Summary Diagnostic Widgets */}
      <DashboardMetricGrid
        budgetUtilization={budgetUtilization}
        monthlyExpenses={monthlyExpenses}
        ccUtilization={ccUtilization}
        totalCCSpent={totalCCSpent}
        investmentGrowth={investmentGrowth}
        savingsRate={savingsRate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
        <button
          onClick={() => setIsQuickLogOpen(true)}
          className="btn btn-primary px-6 py-3 md:px-8 md:py-4 rounded-full shadow-2xl shadow-primary-500/40 border-4 border-white dark:border-gray-900 flex items-center gap-3 active:scale-95 transition-all text-white"
        >
          <div className="p-1 bg-white/20 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-base font-bold">Quick Log</span>
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
      />
    </div>
  );
};

