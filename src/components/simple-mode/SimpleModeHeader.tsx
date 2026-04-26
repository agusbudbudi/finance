import { useMemo } from "react";
import {
  Plus,
  Zap,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  PieChart,
  RefreshCcw,
  CreditCard,
} from "lucide-react";
import { useSimpleTransactionStore } from "../../stores/useSimpleTransactionStore";
import { format, parseISO } from "date-fns";

import { MonthSelector } from "../common/MonthSelector";

interface SimpleModeHeaderProps {
  onAddClick?: () => void;
  onBulkUploadClick?: () => void;
  type?: "expense" | "income" | "summary";
  month: string;
  onMonthChange: (month: string) => void;
  hideStats?: boolean;
}

export const SimpleModeHeader = ({
  onAddClick,
  onBulkUploadClick,
  type = "expense",
  month,
  onMonthChange,
  hideStats = false,
}: SimpleModeHeaderProps) => {
  const { transactions, applyFilters } = useSimpleTransactionStore();

  const isIncome = type === "income";
  const isSummary = type === "summary";
  const accentColor = isIncome ? "green" : isSummary ? "green" : "amber";
  const currentMonthStr = month || format(new Date(), "yyyy-MM");
  const monthName = useMemo(() => format(parseISO(`${currentMonthStr}-01`), "MMMM"), [currentMonthStr]);

  const today = format(new Date(), "yyyy-MM-dd");

  const stats = useMemo(() => {
    let title = "Quick Entry";
    let subtitle = "Fast transaction tracking for your daily spending.";
    let card1Label = "Today's Spending";
    let card2Label = `${monthName}'s Spending`;
    let card1Value = 0;
    let card2Value = 0;
    let card1Sub = "";
    let card2Sub = "";
    let card1Color = isIncome ? "green" : "amber";
    let card2Color = isIncome ? "green" : "primary";
    let card3Color = "blue";
    let card3Label = "";
    let card3Value = 0;
    let card3Sub = "";
    let card3Info = "";
    let showCard3 = false;
    let card2GrossValue = 0;

    if (isIncome) {
      title = "Income Management";
      subtitle = "Record and track your earnings in Simple Mode.";
      card1Label = "Today's Income";
      card2Label = `${monthName}'s Pure Income`;
      const todayTxs = transactions.filter(
        (t) => t.date === today && t.type === "income" && applyFilters(t),
      );
      card1Value = todayTxs.reduce((sum, t) => sum + t.amount, 0);
      card1Sub = `${todayTxs.length} Records`;
      const monthTxs = transactions.filter(
        (t) =>
          t.date.startsWith(currentMonthStr) &&
          t.type === "income" &&
          applyFilters(t),
      );

      const switchingInTxs = monthTxs.filter(
        (t) => t.subCategory === "Switching In",
      );
      const switchingInAmount = switchingInTxs.reduce(
        (sum, t) => sum + t.amount,
        0,
      );

      card2GrossValue = monthTxs.reduce((sum, t) => sum + t.amount, 0);
      card2Value = card2GrossValue - switchingInAmount;
      card2Sub = `${monthTxs.length - switchingInTxs.length} Records`;

      showCard3 = true;
      card3Label = "Switching In / Reimb.";
      card3Value = switchingInAmount;
      card3Sub = `${switchingInTxs.length} Records`;
      card3Color = "blue";
      card3Info =
        "Funds transferred back or reimbursed. Not counted as pure income.";

      card1Color = "green";
      card2Color = "green";
    } else if (isSummary) {
      title = "Simple Mode Summary";
      subtitle = `Financial overview for ${monthName}.`;
      card1Label = `${monthName}'s Pure Income`;
      card2Label = `${monthName}'s Pure Spending`;

      const monthIncomes = transactions.filter(
        (t) =>
          t.date.startsWith(currentMonthStr) &&
          t.type === "income" &&
          applyFilters(t),
      );
      const switchingIn = monthIncomes.filter(
        (t) => t.subCategory === "Switching In",
      );
      card1Value =
        monthIncomes.reduce((sum, t) => sum + t.amount, 0) -
        switchingIn.reduce((sum, t) => sum + t.amount, 0);
      card1Sub = `${monthIncomes.length - switchingIn.length} Earnings`;

      const monthExpenses = transactions.filter(
        (t) =>
          t.date.startsWith(currentMonthStr) &&
          (t.type || "expense") === "expense" &&
          applyFilters(t),
      );
      const switchingOut = monthExpenses.filter(
        (t) => t.subCategory === "Switching Out",
      );
      card2Value =
        monthExpenses.reduce((sum, t) => sum + t.amount, 0) -
        switchingOut.reduce((sum, t) => sum + t.amount, 0);
      card2Sub = `${monthExpenses.length - switchingOut.length} Expenses`;

      const ccExpenses = monthExpenses.filter((t) => t.fromCC === true);
      const ccTotal = ccExpenses.reduce((sum, t) => sum + t.amount, 0);

      showCard3 = true;
      card3Label = "Credit Card Usage";
      card3Value = ccTotal;
      card3Sub = `${ccExpenses.length} Records`;
      card3Color = "purple";
      card3Info = "Total spending placed on credit cards this month.";

      card1Color = "green";
      card2Color = "amber";
    } else {
      card2Label = `${monthName}'s Pure Spending`;
      const todayTxs = transactions.filter(
        (t) =>
          t.date === today &&
          (t.type || "expense") === "expense" &&
          applyFilters(t),
      );
      card1Value = todayTxs.reduce((sum, t) => sum + t.amount, 0);
      card1Sub = `${todayTxs.length} Transactions`;
      const monthTxs = transactions.filter(
        (t) =>
          t.date.startsWith(currentMonthStr) &&
          (t.type || "expense") === "expense" &&
          applyFilters(t),
      );

      const switchingOutTxs = monthTxs.filter(
        (t) => t.subCategory === "Switching Out",
      );
      const switchingOutAmount = switchingOutTxs.reduce(
        (sum, t) => sum + t.amount,
        0,
      );

      card2GrossValue = monthTxs.reduce((sum, t) => sum + t.amount, 0);
      card2Value = card2GrossValue - switchingOutAmount;
      card2Sub = `${monthTxs.length - switchingOutTxs.length} Transactions`;

      showCard3 = true;
      card3Label = "Switching Out";
      card3Value = switchingOutAmount;
      card3Sub = `${switchingOutTxs.length} Records`;
      card3Color = "purple";
      card3Info =
        "Money moved out to savings or investment. Not counted as pure spending.";

      card1Color = "amber";
      card2Color = "primary";
    }

    return {
      title,
      subtitle,
      card1Label,
      card2Label,
      card1Value,
      card2Value,
      card1Sub,
      card2Sub,
      card1Color,
      card2Color,
      card3Color,
      card3Label,
      card3Value,
      card3Sub,
      card3Info,
      showCard3,
      card2GrossValue,
    };
  }, [transactions, isIncome, isSummary, monthName, currentMonthStr, today, applyFilters]);

  const {
    title,
    subtitle,
    card1Label,
    card2Label,
    card1Value,
    card2Value,
    card1Sub,
    card2Sub,
    card1Color,
    card2Color,
    card3Color,
    card3Label,
    card3Value,
    card3Sub,
    card3Info,
    showCard3,
    card2GrossValue,
  } = stats;

  const card1Icon = isIncome ? (
    <TrendingUp className="w-4 h-4" />
  ) : isSummary ? (
    <TrendingUp className="w-4 h-4" />
  ) : (
    <Zap className="w-4 h-4" />
  );
  const card2Icon = isIncome ? (
    <TrendingUp className="w-4 h-4" />
  ) : isSummary ? (
    <TrendingDown className="w-4 h-4" />
  ) : (
    <TrendingUp className="w-4 h-4" />
  );
  const card3Icon = isSummary ? (
    <CreditCard className="w-4 h-4" />
  ) : (
    <RefreshCcw className="w-4 h-4" />
  );

  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`p-1.5 bg-${accentColor}-100 dark:bg-${accentColor}-900/30 rounded-lg`}
            >
              {isIncome ? (
                <TrendingUp
                  className={`w-5 h-5 text-${accentColor}-600 dark:text-${accentColor}-400`}
                />
              ) : isSummary ? (
                <PieChart
                  className={`w-5 h-5 text-${accentColor}-600 dark:text-${accentColor}-400`}
                />
              ) : (
                <Zap
                  className={`w-5 h-5 text-${accentColor}-600 dark:text-${accentColor}-400`}
                />
              )}
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {title}
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MonthSelector value={month} onChange={onMonthChange} />
          {type === "expense" && onBulkUploadClick && (
            <button
              onClick={onBulkUploadClick}
              className="hidden md:flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-1 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl font-bold shadow-md shadow-amber-500/10 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Bulk Import</span>
            </button>
          )}
          {onAddClick && (
            <button
              onClick={onAddClick}
              className={`hidden md:flex items-center justify-center gap-2 px-6 py-3 bg-${accentColor}-500 hover:bg-${accentColor}-600 text-white rounded-xl font-bold shadow-md shadow-${accentColor}-500/10 transition-all active:scale-95`}
            >
              <Plus className="w-5 h-5" />
              <span>{isIncome ? "Add Income" : "Add Transaction"}</span>
            </button>
          )}
        </div>
      </div>

      {!hideStats && (
        <div
          className={`grid grid-cols-1 ${showCard3 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6 relative z-10`}
        >
          {/* Detailed Today Card */}
          <div className="card group relative overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/2">
            <div
              className={`absolute top-0 left-0 w-1.5 h-full bg-${card1Color}-500`}
            ></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    {card1Label}
                  </p>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    Rp {card1Value.toLocaleString("id-ID")}
                  </h3>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-${card1Color}-50 dark:bg-${card1Color}-900/20 flex items-center justify-center text-${card1Color}-500 transition-transform group-hover:scale-110 duration-500`}
                >
                  {card1Icon}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span>{isIncome ? "Earnings Status" : "Daily Velocity"}</span>
                  <span
                    className={card1Value > 0 ? `text-${card1Color}-500` : ""}
                  >
                    {card1Value > 0 ? "Active" : "No activity"}
                  </span>
                </div>
                {isIncome ? (
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                        Records
                      </p>
                      <p className="text-xs font-black text-gray-900 dark:text-white">
                        {
                          transactions.filter(
                            (t) =>
                              t.date.startsWith(
                                new Date().toISOString().split("T")[0],
                              ) && t.type === "income",
                          ).length
                        }{" "}
                        Today
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                        Type
                      </p>
                      <p className="text-xs font-black text-gray-900 dark:text-white">
                        Gross Income
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${card1Color}-500 transition-all duration-1000 ease-out`}
                        style={{
                          width:
                            card1Value > 0
                              ? `${Math.min((card1Value / 500000) * 100, 100)}%`
                              : "0%",
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-gray-500 font-medium italic">
                        {card1Value > 500000
                          ? "High spending today"
                          : "Normal pacing"}
                      </p>
                      <p className="text-[10px] font-black text-gray-400">
                        Limit: 500k
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Monthly Card */}
          <div className="card group relative overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/2">
            <div
              className={`absolute top-0 left-0 w-1.5 h-full bg-${card2Color}-500`}
            ></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    {card2Label}
                  </p>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    Rp {card2Value.toLocaleString("id-ID")}
                  </h3>
                  {!isSummary && (
                    <p className="text-xs font-bold text-gray-400 mt-1">
                      Gross: Rp {card2GrossValue.toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-${card2Color}-50 dark:bg-${card2Color}-900/20 flex items-center justify-center text-${card2Color}-500 transition-transform group-hover:scale-110 duration-500`}
                >
                  {card2Icon}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Total
                  </p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">
                    {card2Sub}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Daily Avg
                  </p>
                  <p className="text-sm font-black text-gray-900 dark:text-white">
                    Rp {Math.round(card2Value / 30).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Card 3 (Switching In) */}
          {showCard3 && (
            <div className="card group relative overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/2">
              <div
                className={`absolute top-0 left-0 w-1.5 h-full bg-${card3Color}-500`}
              ></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      {card3Label}
                    </p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                      Rp {card3Value.toLocaleString("id-ID")}
                    </h3>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-${card3Color}-50 dark:bg-${card3Color}-900/20 flex items-center justify-center text-${card3Color}-500 transition-transform group-hover:scale-110 duration-500`}
                  >
                    {card3Icon}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800 col-span-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Info
                    </p>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {card3Info}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Sticky Actions - Matched with global mobile action bar style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-900 z-50 flex flex-col gap-3">
        {onAddClick && (
          <button
            onClick={onAddClick}
            className={`btn w-full py-4 bg-${accentColor}-500 text-white font-black shadow-xl shadow-${accentColor}-500/20 active:scale-95 transition-all`}
          >
            <Plus className="w-5 h-5" />
            <span>{isIncome ? "Add Income" : "Add Transaction"}</span>
          </button>
        )}
        {type === "expense" && onBulkUploadClick && (
          <button
            onClick={onBulkUploadClick}
            className="btn w-full py-4 bg-transparent border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white font-black shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Bulk Import</span>
          </button>
        )}
      </div>
    </div>
  );
};
