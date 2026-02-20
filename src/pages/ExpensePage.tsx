import { useState, useMemo } from "react";
import { useExpenseStore } from "../stores/useExpenseStore";
import { useAccountsStore } from "../stores/useAccountsStore";
import { useCreditCardStore } from "../stores/useCreditCardStore";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { EmptyState } from "../components/common/EmptyState";
import { MonthSelector } from "../components/common/MonthSelector";
import { formatCurrency, formatDate, getMonthName } from "../utils/formatters";
import {
  Plus,
  Trash2,
  Filter,
  Calendar,
  Wallet,
  CreditCard,
  Tag,
  Search,
  ShoppingCart,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ArrowDownRight,
  ArrowRightLeft,
} from "lucide-react";
import { Expense, ExpenseCategory } from "../types/expense";
import { CATEGORY_LABELS, MONTHS } from "../utils/constants";

const CATEGORIES: ExpenseCategory[] = [
  "Food & Drink",
  "Transportation",
  "Shopping",
  "Utilities",
  "Entertainment",
  "Health",
  "Investment",
  "Other",
];

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  expenseSchema,
  ExpenseFormData,
} from "../services/validators/expenseSchema";

export const ExpensePage = () => {
  const { expenses, addExpense, deleteExpense } = useExpenseStore();
  const { accounts } = useAccountsStore();
  const { cards } = useCreditCardStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  ); // YYYY-MM

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      amount: "",
      category: "Food & Drink",
      accountId: "",
      note: "",
    },
  });

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.date.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedMonth]);

  const stats = useMemo(() => {
    // Only sum manual deductions, exclude internal exchanges/allocations
    const total = filteredExpenses
      .filter((e) => e.type !== "allocation")
      .reduce((sum, e) => sum + e.amount, 0);

    const byCategory = filteredExpenses
      .filter((e) => e.type !== "allocation")
      .reduce(
        (acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

    const topCategory = Object.entries(byCategory).sort(
      (a, b) => b[1] - a[1],
    )[0];

    return { total, topCategory };
  }, [filteredExpenses]);

  const onAddExpense = (data: ExpenseFormData) => {
    const amountNum = parseInt(data.amount);
    const isBank = accounts.some((a) => a.id === data.accountId);

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date: data.date,
      amount: amountNum,
      category: data.category as any,
      accountId: data.accountId,
      accountType: isBank ? "bank" : "credit_card",
      note: data.note || "",
      type: "manual",
      createdAt: new Date().toISOString(),
    };

    addExpense(newExpense);
    setIsAddModalOpen(false);
    reset();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Transactions
          </h2>
          <p className="text-gray-500 dark:text-white/70 font-medium">
            History of your financial activities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn bg-primary-500 dark:bg-white text-white dark:text-primary-500 hover:opacity-90 shadow-lg shadow-black/10"
          >
            <Plus className="w-5 h-5" />
            Log Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sticky Summary */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <Card
            variant="blue"
            className="border-none relative overflow-hidden group shadow-2xl shadow-primary-500/20"
            bodyClassName="p-6"
          >
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
            <div className="relative z-10 space-y-8 text-white">
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">
                  Total Monthly Spend
                </p>
                <h3 className="text-4xl font-black tracking-tight">
                  {formatCurrency(stats.total)}
                </h3>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1">
                  * Excludes internal exchanges
                </p>
              </div>
              <div className="pt-6 border-t border-white/20">
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 bg-black/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Calendar className="w-3 h-3" />
                  Real-time synchronization
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col justify-between" bodyClassName="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                  Top Burning Category
                </p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white capitalize tracking-tight">
                  {stats.topCategory ? stats.topCategory[0] : "None"}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500 shadow-sm border border-red-100 dark:border-red-900/20">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            {stats.topCategory && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                <p className="text-[10px] font-black text-gray-500 dark:text-white/40 uppercase tracking-widest">
                  Total spent
                </p>
                <p className="text-sm font-black text-red-500">
                  {formatCurrency(stats.topCategory[1])}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Transaction Log */}
        <Card
          title="Transaction History"
          subtitle="Detailed log of your spending and movements"
          className="lg:col-span-8"
          bodyClassName="p-0"
        >
          {filteredExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 pt-4 pb-4 font-black text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      Type
                    </th>
                    <th className="px-6 pt-4 pb-4 font-black text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      Date
                    </th>
                    <th className="px-6 pt-4 pb-4 font-black text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      Category
                    </th>
                    <th className="px-6 pt-4 pb-4 font-black text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      Account
                    </th>
                    <th className="px-6 pt-4 pb-4 font-black text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      Note
                    </th>
                    <th className="px-6 pt-4 pb-4 font-black text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">
                      Amount
                    </th>
                    <th className="px-6 pt-4 pb-4 font-black text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="group/row hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-300"
                    >
                      <td className="px-6 py-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover/row:scale-110 ${
                            expense.type === "allocation"
                              ? "bg-primary-50 text-primary-500 border-primary-100 dark:bg-primary-900/10 dark:text-primary-400 dark:border-primary-900/20"
                              : "bg-red-50 text-red-500 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20"
                          }`}
                          title={
                            expense.type === "allocation"
                              ? "Exchange (Allocation)"
                              : "Deducted (Manual)"
                          }
                        >
                          {expense.type === "allocation" ? (
                            <ArrowRightLeft className="w-5 h-5" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-500 dark:text-gray-400">
                        {formatDate(expense.date, "short")}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        <span
                          className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-colors ${
                            expense.category === "Food & Drink"
                              ? "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900/20"
                              : expense.category === "Transportation"
                                ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20"
                                : expense.category === "Shopping"
                                  ? "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-900/20"
                                  : expense.category === "Utilities"
                                    ? "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/10 dark:text-indigo-400 dark:border-indigo-900/20"
                                    : expense.category === "Health"
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20"
                                      : expense.category === "Entertainment"
                                        ? "bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-900/10 dark:text-pink-400 dark:border-pink-900/20"
                                        : expense.category === "Investment"
                                          ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/20"
                                          : "bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700"
                          }`}
                        >
                          {CATEGORY_LABELS[expense.category] ||
                            expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${expense.accountType === "bank" ? "bg-primary-50 dark:bg-primary-900/20 text-primary-500" : "bg-purple-50 dark:bg-purple-900/20 text-purple-500"}`}
                          >
                            {expense.accountType === "bank" ? (
                              <Wallet className="w-4 h-4" />
                            ) : (
                              <CreditCard className="w-4 h-4" />
                            )}
                          </div>
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {accounts.find((a) => a.id === expense.accountId)
                              ?.name ||
                              cards.find((c) => c.id === expense.accountId)
                                ?.bank ||
                              "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 italic">
                        {expense.note || "-"}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white text-lg tabular-nums">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all opacity-0 group-hover/row:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={ShoppingCart}
              title="No transactions recorded"
              description="Start tracking your spending to see the analytics."
              className="m-6"
            />
          )}
        </Card>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log New Expense"
      >
        <form onSubmit={handleSubmit(onAddExpense)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-white/40 uppercase mb-2 tracking-widest ml-1">
                Date
              </label>
              <input
                type="date"
                {...register("date")}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all ${
                  errors.date
                    ? "border-red-500"
                    : "border-gray-100 dark:border-gray-800"
                }`}
              />
              {errors.date && (
                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                  {errors.date.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-white/40 uppercase mb-2 tracking-widest ml-1">
                Amount (IDR)
              </label>
              <input
                type="number"
                {...register("amount")}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all ${
                  errors.amount
                    ? "border-red-500"
                    : "border-gray-100 dark:border-gray-800"
                }`}
                placeholder="0"
              />
              {errors.amount && (
                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
              Category
            </label>
            <select
              {...register("category")}
              className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all ${
                errors.category
                  ? "border-red-500"
                  : "border-gray-100 dark:border-gray-800"
              }`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
              Paid From
            </label>
            <select
              {...register("accountId")}
              className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all appearance-none ${
                errors.accountId
                  ? "border-red-500"
                  : "border-gray-100 dark:border-gray-800"
              }`}
            >
              <option value="">Select account or wallet</option>
              <optgroup label="Accounts Hub (Liquid Assets)">
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bank}: {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Credit Cards">
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.bank} (**** {card.lastFourDigits})
                  </option>
                ))}
              </optgroup>
            </select>
            {errors.accountId && (
              <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                {errors.accountId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
              Note / Merchant
            </label>
            <input
              type="text"
              {...register("note")}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
              placeholder="e.g. Starbucks, Go-jek, PLN"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn btn-primary">
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
