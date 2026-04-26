import { useState, useMemo } from "react";
import { useSimpleTransactionStore } from "../stores/useSimpleTransactionStore";
import { TrendingDown, TrendingUp, Layers, PieChart, Zap, Activity, CreditCard, ArrowRight } from "lucide-react";
import { SimpleModeHeader } from "../components/simple-mode/SimpleModeHeader";
import { format, parseISO } from "date-fns";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export const SimpleSummaryPage = () => {
  const { transactions, applyFilters } = useSimpleTransactionStore();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const monthName = useMemo(() => format(parseISO(`${selectedMonth}-01`), "MMMM"), [selectedMonth]);

  const [activeTab, setActiveTab] = useState<"graph" | "income" | "spending" | "ccSpending">(
    "graph",
  );

  const {
    expenses,
    incomes,
    switchingOut,
    switchingIn,
    totalSwitchingOut,
    totalSwitchingIn,
    netSwitching,
    totalExpense,
    totalPureExpense,
    sortedExpenseCategories,
    sortedExpenseSubCategories,
    totalIncome,
    totalPureIncome,
    sortedIncomeCategories,
    sortedIncomeSubCategories,
    totalCCExpense,
    totalPureCCExpense,
    sortedCCCategories,
    sortedCCSubCategories,
  } = useMemo(() => {
    const expenses = transactions.filter(
      (tx) =>
        (tx.type || "expense") === "expense" && 
        tx.date.startsWith(selectedMonth) &&
        applyFilters(tx),
    );
    const incomes = transactions.filter(
      (tx) => 
        tx.type === "income" && 
        tx.date.startsWith(selectedMonth) &&
        applyFilters(tx),
    );

    // --- REIMBURSEMENT (SWITCHING) STATS ---
    const switchingOut = expenses.filter((tx) => tx.subCategory === "Switching Out");
    const switchingIn = incomes.filter((tx) => tx.subCategory === "Switching In");
    const totalSwitchingOut = switchingOut.reduce((sum, tx) => sum + tx.amount, 0);
    const totalSwitchingIn = switchingIn.reduce((sum, tx) => sum + tx.amount, 0);
    const netSwitching = totalSwitchingOut - totalSwitchingIn;

    // --- EXPENSE STATS ---
    const totalExpense = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    const totalPureExpense = totalExpense - totalSwitchingOut;
    const expenseCategorySummary = expenses.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
    const sortedExpenseCategories = Object.entries(expenseCategorySummary).sort((a, b) => b[1] - a[1]);

    const expenseSubCategorySummary = expenses.reduce((acc, tx) => {
      const key = `${tx.category} > ${tx.subCategory}`;
      acc[key] = (acc[key] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
    const sortedExpenseSubCategories = Object.entries(expenseSubCategorySummary).sort((a, b) => b[1] - a[1]);

    // --- INCOME STATS ---
    const totalIncome = incomes.reduce((sum, tx) => sum + tx.amount, 0);
    const totalPureIncome = totalIncome - totalSwitchingIn;
    const incomeCategorySummary = incomes.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
    const sortedIncomeCategories = Object.entries(incomeCategorySummary).sort((a, b) => b[1] - a[1]);

    const incomeSubCategorySummary = incomes.reduce((acc, tx) => {
      const key = `${tx.category} > ${tx.subCategory}`;
      acc[key] = (acc[key] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
    const sortedIncomeSubCategories = Object.entries(incomeSubCategorySummary).sort((a, b) => b[1] - a[1]);

    // --- CC SPENDING STATS ---
    const ccExpenses = expenses.filter((tx) => tx.fromCC);
    const totalCCExpense = ccExpenses.reduce((sum, tx) => sum + tx.amount, 0);
    const ccSwitchingOut = ccExpenses.filter((tx) => tx.subCategory === "Switching Out");
    const totalCCSwitchingOut = ccSwitchingOut.reduce((sum, tx) => sum + tx.amount, 0);
    const totalPureCCExpense = totalCCExpense - totalCCSwitchingOut;

    const ccCategorySummary = ccExpenses.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
    const sortedCCCategories = Object.entries(ccCategorySummary).sort((a, b) => b[1] - a[1]);

    const ccSubCategorySummary = ccExpenses.reduce((acc, tx) => {
      const key = `${tx.category} > ${tx.subCategory}`;
      acc[key] = (acc[key] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
    const sortedCCSubCategories = Object.entries(ccSubCategorySummary).sort((a, b) => b[1] - a[1]);

    return {
      expenses,
      incomes,
      switchingOut,
      switchingIn,
      totalSwitchingOut,
      totalSwitchingIn,
      netSwitching,
      totalExpense,
      totalPureExpense,
      sortedExpenseCategories,
      sortedExpenseSubCategories,
      totalIncome,
      totalPureIncome,
      sortedIncomeCategories,
      sortedIncomeSubCategories,
      totalCCExpense,
      totalPureCCExpense,
      sortedCCCategories,
      sortedCCSubCategories,
    };
  }, [transactions, selectedMonth, applyFilters]);

  return (
    <div className="max-w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <SimpleModeHeader
        type="summary"
        month={selectedMonth}
        onMonthChange={setSelectedMonth}
        hideStats={true}
      />

      {/* Tab Navigation - Aligned Left with Icons */}
      <div className="flex justify-start">
        <div className="pill-nav p-1.5 bg-gray-100/50 dark:bg-gray-800/30 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 shadow-inner rounded-xl flex items-center gap-1">
          <button
            onClick={() => setActiveTab("graph")}
            className={`pill-nav-item px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 rounded-[0.8rem] ${
              activeTab === "graph"
                ? "bg-white dark:bg-gray-700 text-primary-500 shadow-lg shadow-primary-500/10 scale-105"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Graph</span>
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={`pill-nav-item px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 rounded-[0.8rem] ${
              activeTab === "income"
                ? "bg-white dark:bg-gray-700 text-green-500 shadow-lg shadow-green-500/10 scale-105"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Income</span>
          </button>
          <button
            onClick={() => setActiveTab("spending")}
            className={`pill-nav-item px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 rounded-[0.8rem] ${
              activeTab === "spending"
                ? "bg-white dark:bg-gray-700 text-amber-500 shadow-lg shadow-amber-500/10 scale-105"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Spending</span>
          </button>
          <button
            onClick={() => setActiveTab("ccSpending")}
            className={`pill-nav-item px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 rounded-[0.8rem] ${
              activeTab === "ccSpending"
                ? "bg-white dark:bg-gray-700 text-primary-500 shadow-lg shadow-primary-500/10 scale-105"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>CC Spending</span>
          </button>
        </div>
      </div>

      {activeTab === "graph" && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Highlights moved here into Graph tab */}
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 relative z-10">
            {/* Informative Pure Income Card */}
            <div className="card group relative overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/2">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      {monthName} Pure Income
                    </p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                      Rp {totalPureIncome.toLocaleString("id-ID")}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500 transition-transform group-hover:scale-110 duration-500">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Gross Total
                    </p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      Rp {totalIncome.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Records
                    </p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {incomes.length} Entries
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Incl. {switchingIn.length} Reimbursements
                  </p>
                </div>
              </div>
            </div>

            {/* Informative Pure Spending Card */}
            <div className="card group relative overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/2">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      {monthName} Pure Spending
                    </p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                      Rp {totalPureExpense.toLocaleString("id-ID")}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 transition-transform group-hover:scale-110 duration-500">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Daily Avg
                    </p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      Rp{" "}
                      {Math.round(totalPureExpense / 30).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Records
                    </p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {expenses.length - switchingOut.length} Personal
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Tracking {expenses.length} Total Items
                  </p>
                </div>
              </div>
            </div>

            {/* Informative CC Spending Card */}
            <div className="card group relative overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/2">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      {monthName} CC Usage
                    </p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                      Rp {totalCCExpense.toLocaleString("id-ID")}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500 transition-transform group-hover:scale-110 duration-500">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800 col-span-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Info
                    </p>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      Total spending placed on credit cards this month.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reimbursement Tracking - Moved Above Charts and Restyled */}
          <section className="space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-500" /> Reimbursement Tracking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card group relative overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/2 p-5 transition-all hover:scale-[1.01]">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Switching Out</p>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Rp {totalSwitchingOut.toLocaleString("id-ID")}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{switchingOut.length} Items Paid</p>
              </div>

              <div className="card group relative overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/2 p-5 transition-all hover:scale-[1.01]">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Switching In</p>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Rp {totalSwitchingIn.toLocaleString("id-ID")}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{switchingIn.length} Items Reimbursed</p>
              </div>

              <div className={`card group relative overflow-hidden ${netSwitching > 0 ? "bg-red-50/30 dark:bg-red-900/10 border-red-100/50" : "bg-blue-50/30 dark:bg-blue-900/10 border-blue-100/50"} border shadow-lg shadow-black/2 p-5 transition-all hover:scale-[1.01]`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${netSwitching > 0 ? "bg-red-500" : "bg-blue-500"}`}></div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Net Balance</p>
                    <h4 className={`text-xl font-black ${netSwitching > 0 ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"} tracking-tight`}>
                      {netSwitching > 0 ? "+ " : ""}Rp {netSwitching.toLocaleString("id-ID")}
                    </h4>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${netSwitching > 0 ? "bg-red-100 dark:bg-red-900/30 text-red-500" : "bg-blue-100 dark:bg-blue-900/30 text-blue-500"} flex items-center justify-center`}>
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  {netSwitching > 0 ? "Outstanding" : "Fully Reimbursed"}
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-800" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SummaryChart 
              type="bar"
              title="Income Distribution" 
              description="Detailed breakdown of your pure income sources for this month."
              data={sortedIncomeSubCategories} 
              colorScheme="green"
            />
            <SummaryChart 
              type="pie"
              title="Spending Distribution" 
              description="Proportional view of your pure expenses across all sub-categories."
              data={sortedExpenseSubCategories} 
              colorScheme="amber"
            />
          </div>
        </div>
      )}

      {activeTab === "income" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="card p-8 bg-green-500 border-none relative overflow-hidden shadow-xl shadow-green-500/20">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">
                  {monthName} Pure Income
                </p>
                <h2 className="text-4xl font-black text-white tracking-tighter">
                  Rp {totalPureIncome.toLocaleString("id-ID")}
                </h2>
              </div>
              <div className="md:text-right pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/20 md:pl-6">
                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">
                  Total Gross Income
                </p>
                <h3 className="text-xl font-black text-white">
                  Rp {totalIncome.toLocaleString("id-ID")}
                </h3>
              </div>
            </div>
            <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 -rotate-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-500" /> Income per
                Category
              </h3>
              <SummaryTable
                data={sortedIncomeCategories}
                totalForPercentage={totalIncome}
                colorClass="text-green-600 dark:text-green-400"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-500" /> Income per
                Sub-Category
              </h3>
              <SummaryTable
                data={sortedIncomeSubCategories}
                isSubCategory
                totalForPercentage={totalIncome}
                colorClass="text-green-600 dark:text-green-400"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "spending" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="card p-8 bg-amber-500 border-none relative overflow-hidden shadow-xl shadow-amber-500/20">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">
                  {monthName} Pure Spending
                </p>
                <h2 className="text-4xl font-black text-white tracking-tighter">
                  Rp {totalPureExpense.toLocaleString("id-ID")}
                </h2>
              </div>
              <div className="md:text-right pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/20 md:pl-6">
                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">
                  Total Gross Spending
                </p>
                <h3 className="text-xl font-black text-white">
                  Rp {totalExpense.toLocaleString("id-ID")}
                </h3>
              </div>
            </div>
            <TrendingDown className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 -rotate-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" /> Spending per
                Category
              </h3>
              <SummaryTable
                data={sortedExpenseCategories}
                totalForPercentage={totalPureIncome}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" /> Spending per
                Sub-Category
              </h3>
              <SummaryTable
                data={sortedExpenseSubCategories}
                isSubCategory
                totalForPercentage={totalPureIncome}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "ccSpending" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="card p-8 bg-primary-600 border-none relative overflow-hidden shadow-xl shadow-primary-500/20">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">
                  {monthName} Pure CC Spending
                </p>
                <h2 className="text-4xl font-black text-white tracking-tighter">
                  Rp {totalPureCCExpense.toLocaleString("id-ID")}
                </h2>
              </div>
              <div className="md:text-right pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/20 md:pl-6">
                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">
                  Total Gross CC Spending
                </p>
                <h3 className="text-xl font-black text-white">
                  Rp {totalCCExpense.toLocaleString("id-ID")}
                </h3>
              </div>
            </div>
            <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 -rotate-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-500" /> CC Spending per
                Category
              </h3>
              <SummaryTable
                data={sortedCCCategories}
                totalForPercentage={totalPureIncome}
                colorClass="text-primary-600 dark:text-primary-400"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-500" /> CC Spending per
                Sub-Category
              </h3>
              <SummaryTable
                data={sortedCCSubCategories}
                isSubCategory
                totalForPercentage={totalPureIncome}
                colorClass="text-primary-600 dark:text-primary-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryChart = ({
  title,
  description,
  data,
  colorScheme,
  type = "pie",
}: {
  title: string;
  description?: string;
  data: [string, number][];
  colorScheme: "green" | "amber";
  type?: "pie" | "bar";
}) => {
  // Absolute total from all data, not just Top 10
  const absoluteTotal = data
    .filter(([label]) => !label.includes("Switching"))
    .reduce((sum, [, value]) => sum + value, 0);

  const allFilteredData = data
    .filter(([label]) => !label.includes("Switching"))
    .map(([label, value]) => ({
      name: label.split(" > ")[1] || label,
      value,
    }));

  const top10Data = allFilteredData.slice(0, 10);
  const othersData = allFilteredData.slice(10);
  
  const chartData = top10Data;
  if (othersData.length > 0) {
    const othersValue = othersData.reduce((sum, item) => sum + item.value, 0);
    chartData.push({
      name: "Others",
      value: othersValue,
    });
  }

  const COLORS =
    colorScheme === "green"
      ? [
          "#059669",
          "#10b981",
          "#34d399",
          "#6ee7b7",
          "#a7f3d0",
          "#064e3b",
          "#065f46",
          "#047857",
          "#059669",
          "#10b981",
        ]
      : [
          "#d97706",
          "#f59e0b",
          "#fbbf24",
          "#fcd34d",
          "#fde68a",
          "#78350f",
          "#92400e",
          "#b45309",
          "#d97706",
          "#f59e0b",
        ];

  return (
    <div className="card p-6 flex flex-col h-auto relative group">
      <div className="flex flex-col mb-6">
        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-400 font-medium mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="relative w-full h-[300px]">
        {type === "pie" ? (
          <>
            {/* Central Total Display - Perfectly Centered, lower z-index */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
              <div
                className={`p-1.5 rounded-full mb-1 ${colorScheme === "green" ? "bg-green-50 text-green-500" : "bg-amber-50 text-amber-500"}`}
              >
                {colorScheme === "green" ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Total
              </p>
              <p
                className={`text-2xl font-black ${colorScheme === "green" ? "text-green-600" : "text-amber-600"} leading-none`}
              >
                Rp
                {absoluteTotal > 1000000
                  ? (absoluteTotal / 1000000).toFixed(1) + "M"
                  : (absoluteTotal / 1000).toFixed(0) + "K"}
              </p>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={115}
                  paddingAngle={0}
                  dataKey="value"
                  animationDuration={1500}
                  animationBegin={200}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) =>
                    `Rp ${Number(value).toLocaleString("id-ID")}`
                  }
                  wrapperStyle={{ zIndex: 100 }}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    padding: "12px 16px",
                    fontWeight: "900",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#111827" }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#9ca3af" }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#9ca3af" }}
                tickFormatter={(value) =>
                  `Rp${value >= 1000000 ? (value / 1000000).toFixed(1) + "M" : (value / 1000).toFixed(0) + "K"}`
                }
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.02)" }}
                formatter={(value: any) =>
                  `Rp ${Number(value).toLocaleString("id-ID")}`
                }
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  fontWeight: "900",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                animationDuration={1500}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Custom Legend - Handles multi-line/overflow perfectly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 mt-8 border-t border-gray-50 dark:border-gray-800 pt-6">
        {chartData.map((entry, index) => (
          <div
            key={`legend-${index}`}
            className="flex items-center justify-between group/item py-0.5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight truncate">
                {entry.name}
              </span>
            </div>
            <span className="text-[10px] font-black text-gray-900 dark:text-gray-400 shrink-0 ml-2">
              {absoluteTotal > 0
                ? ((entry.value / absoluteTotal) * 100).toFixed(0)
                : 0}
              %
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SummaryTable = ({
  data,
  isSubCategory = false,
  totalForPercentage = 0,
  colorClass = "text-gray-900 dark:text-white",
  itemsPerPage = 10,
}: {
  data: [string, number][];
  isSubCategory?: boolean;
  totalForPercentage?: number;
  colorClass?: string;
  itemsPerPage?: number;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="card overflow-hidden border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/2 bg-white dark:bg-gray-900/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800">
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0">
                {isSubCategory ? "Details" : "Category"}
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0 text-right">
                Amount
              </th>
              {totalForPercentage > 0 && (
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0 text-right">
                  % of Income
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginatedData.map(([label, amount]) => (
              <tr
                key={label}
                className="even:bg-gray-50/40 dark:even:bg-white/[0.02] hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors"
              >
                <td className="px-6 py-3 border-r border-gray-50/50 dark:border-gray-800/50 last:border-r-0">
                  {isSubCategory ? (
                    <>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">
                        {label.split(" > ")[1]}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">
                        {label.split(" > ")[0]}
                      </p>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {label}
                    </span>
                  )}
                </td>
                <td
                  className={`px-6 py-3 border-r border-gray-50/50 dark:border-gray-800/50 last:border-r-0 text-sm font-black text-right ${colorClass}`}
                >
                  Rp {amount.toLocaleString("id-ID")}
                </td>
                {totalForPercentage > 0 && (
                  <td className="px-6 py-3 border-r border-gray-50/50 dark:border-gray-800/50 last:border-r-0 text-sm font-bold text-right text-gray-500">
                    {((amount / totalForPercentage) * 100).toFixed(1)}%
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={totalForPercentage > 0 ? 3 : 2}
                  className="px-6 py-12 text-center text-sm text-gray-400 font-medium italic"
                >
                  No data available for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 disabled:opacity-30 transition-all active:scale-95 text-gray-600 dark:text-gray-400"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 disabled:opacity-30 transition-all active:scale-95 text-gray-600 dark:text-gray-400"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
