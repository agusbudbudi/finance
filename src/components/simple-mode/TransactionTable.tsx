import { useState } from "react";
import { Trash2, ArrowRight, Filter, X, Calendar, Search } from "lucide-react";
import { useSimpleTransactionStore } from "../../stores/useSimpleTransactionStore";
import { useSimpleModeConfig } from "../../hooks/useSimpleModeConfig";
import { format, parseISO, endOfMonth } from "date-fns";

interface TransactionTableProps {
  type?: "expense" | "income";
  month?: string; // YYYY-MM
}

export const TransactionTable = ({ type, month }: TransactionTableProps) => {
  const {
    transactions,
    deleteTransaction,
    filters,
    setFilters,
    resetFilters,
  } = useSimpleTransactionStore();
  const { config } = useSimpleModeConfig();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // UI state for filter panel visibility
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredTransactions = transactions.filter((tx) => {
    const typeMatch = type ? (tx.type || "expense") === type : true;
    const monthMatch = month ? tx.date.startsWith(month) : true;

    // Advanced Filters
    const dateRangeMatch =
      (!filters.startDate || tx.date >= filters.startDate) &&
      (!filters.endDate || tx.date <= filters.endDate);

    const fromMatch =
      !filters.fromSource ||
      tx.fromBank === filters.fromSource ||
      tx.creditCardName === filters.fromSource;

    const toMatch = !filters.toSource || tx.toBank === filters.toSource;

    const categoryMatch = !filters.category || tx.category === filters.category;

    const ccMatch = filters.fromCC === null || tx.fromCC === filters.fromCC;

    return (
      typeMatch &&
      monthMatch &&
      dateRangeMatch &&
      fromMatch &&
      toMatch &&
      categoryMatch &&
      ccMatch
    );
  });

  const minDate = month ? `${month}-01` : "";
  const maxDate = month
    ? format(endOfMonth(parseISO(`${month}-01`)), "yyyy-MM-dd")
    : "";

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
          Recent{" "}
          {type === "expense"
            ? "Expenses"
            : type === "income"
              ? "Income"
              : "Transactions"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              isFilterOpen ||
              Object.values(filters).some((v) => v !== "" && v !== null)
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                : "bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {Object.values(filters).some((v) => v !== "" && v !== null) && (
              <span className="ml-1 w-2 h-2 rounded-full bg-white animate-pulse"></span>
            )}
          </button>
          {(isFilterOpen ||
            Object.values(filters).some((v) => v !== "" && v !== null)) && (
            <button
              onClick={resetFilters}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {isFilterOpen && (
        <div className="card p-6 bg-gray-50/50 dark:bg-gray-900/50 border-dashed animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Date Range */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Date Range
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    min={minDate}
                    max={maxDate}
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ startDate: e.target.value })
                    }
                    className="input pl-8 py-1.5 text-xs rounded-lg"
                  />
                </div>
                <span className="text-gray-300 font-bold">-</span>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    min={minDate}
                    max={maxDate}
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ endDate: e.target.value })
                    }
                    className="input pl-8 py-1.5 text-xs rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Source Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                {type === "income" ? "Deposit To" : "From Bank / CC"}
              </label>
              <select
                value={
                  type === "income" ? filters.toSource : filters.fromSource
                }
                onChange={(e) =>
                  setFilters({
                    [type === "income" ? "toSource" : "fromSource"]:
                      e.target.value,
                  })
                }
                className="input py-1.5 text-xs rounded-lg"
              >
                <option value="">All Sources</option>
                {config?.banks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
                {type !== "income" &&
                  config?.creditCards.map((cc) => (
                    <option key={cc} value={cc}>
                      {cc}
                    </option>
                  ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ category: e.target.value })
                }
                className="input py-1.5 text-xs rounded-lg"
              >
                <option value="">All Categories</option>
                {config &&
                  Object.keys(
                    type === "income"
                      ? config.incomeCategories
                      : config.categories,
                  ).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>

            {/* Toggle Filter */}
            {type === "expense" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Payment Method
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setFilters({
                        fromCC: filters.fromCC === true ? null : true,
                      })
                    }
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                      filters.fromCC === true
                        ? "bg-purple-500 text-white border-purple-500"
                        : "bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700"
                    }`}
                  >
                    Credit Card
                  </button>
                  <button
                    onClick={() =>
                      setFilters({
                        fromCC: filters.fromCC === false ? null : false,
                      })
                    }
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                      filters.fromCC === false
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700"
                    }`}
                  >
                    Bank / Cash
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {filteredTransactions.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            No matches found
          </h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Try adjusting your filters or search terms to find what you're
            looking for.
          </p>
          {(isFilterOpen ||
            Object.values(filters).some((v) => v !== "" && v !== null)) && (
            <button
              onClick={resetFilters}
              className="mt-4 text-xs font-black uppercase tracking-widest text-primary-500 hover:text-primary-600 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg shadow-black/2 bg-white dark:bg-gray-900/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0">
                  Date
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0">
                  {type === "income" ? "To Bank" : "From / To"}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0">
                  Category
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0">
                  Description
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0 text-right">
                  Amount
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="even:bg-gray-50/40 dark:even:bg-white/[0.02] hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors group"
                >
                  <td className="px-6 py-3 border-r border-gray-50/50 dark:border-gray-800/50 last:border-r-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {format(parseISO(tx.date), "dd MMM yyyy")}
                    </p>
                  </td>
                  <td className="px-6 py-3 border-r border-gray-50/50 dark:border-gray-800/50 last:border-r-0">
                    <div className="flex items-center gap-2">
                      {tx.type === "expense" ? (
                        <>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md ${tx.fromCC ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"}`}
                          >
                            {tx.fromCC ? tx.creditCardName : tx.fromBank}
                          </span>
                          {tx.toBank && (
                            <>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                {tx.toBank}
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                          {tx.toBank}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 border-r border-gray-50/50 dark:border-gray-800/50 last:border-r-0">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {tx.category}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {tx.subCategory}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-3 border-r border-gray-50/50 dark:border-gray-800/50 last:border-r-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate max-w-[200px]">
                      {tx.description || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-2.5 text-right">
                    <p
                      className={`text-sm font-black ${tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}
                    >
                      {tx.type === "income" ? "+ " : ""}Rp{" "}
                      {tx.amount.toLocaleString("id-ID")}
                    </p>
                  </td>
                  <td className="px-6 py-3 border-r border-gray-50/50 dark:border-gray-800/50 last:border-r-0">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete this ${tx.type}?`,
                            )
                          ) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 disabled:opacity-30 transition-all active:scale-95 text-gray-600 dark:text-gray-400"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 disabled:opacity-30 transition-all active:scale-95 text-gray-600 dark:text-gray-400"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
