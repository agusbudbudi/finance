import { useState } from "react";
import { useFreelanceStore } from "../stores/useFreelanceStore";
import { useAccountsStore } from "../stores/useAccountsStore";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { EmptyState } from "../components/common/EmptyState";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
  Briefcase,
  Plus,
  Filter,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Save,
  PieChart,
  Info,
  TrendingUp,
} from "lucide-react";
import { FreelanceIncome, FreelanceAllocation } from "../types/freelance";

export const FreelancePage = () => {
  const { incomes, addIncome, allocateIncome, deleteIncome } =
    useFreelanceStore();
  const { getAccountById } = useAccountsStore();

  // Add Income Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    client: "",
    project: "",
    category: "Freelance" as "Freelance" | "Bonus" | "THR" | "Other",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Allocation Modal
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [activeIncome, setActiveIncome] = useState<FreelanceIncome | null>(
    null,
  );
  const [allocPercentages, setAllocPercentages] = useState({
    savings: 60,
    spending: 20,
    investment: 20,
  });

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const currentYear = new Date().getFullYear();
  const yearlyIncome = incomes
    .filter((i) => new Date(i.date).getFullYear() === currentYear)
    .reduce((sum, i) => sum + i.amount, 0);

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(addFormData.amount);
    if (isNaN(amount) || amount <= 0) return;

    const newIncome: FreelanceIncome = {
      id: crypto.randomUUID(),
      date: addFormData.date,
      category: addFormData.category,
      client: addFormData.client,
      project: addFormData.project,
      amount: amount,
      receivedAt: new Date().toISOString(),
      toAccount: "acc_004", // Hardcoded BRI Freelance Account per Requirement
      allocations: [],
      status: "pending",
    };

    addIncome(newIncome);
    setIsAddModalOpen(false);
    setAddFormData({
      client: "",
      project: "",
      category: "Freelance",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIncome) return;

    const sum =
      allocPercentages.savings +
      allocPercentages.spending +
      allocPercentages.investment;
    if (sum !== 100) {
      alert("Total allocation must equal 100%");
      return;
    }

    const allocations: FreelanceAllocation[] = [
      {
        id: crypto.randomUUID(),
        category: "savings",
        amount: (activeIncome.amount * allocPercentages.savings) / 100,
        toAccount: "acc_001",
        isCompleted: true,
      },
      {
        id: crypto.randomUUID(),
        category: "spending",
        amount: (activeIncome.amount * allocPercentages.spending) / 100,
        toAccount: "acc_005",
        isCompleted: true,
      },
      {
        id: crypto.randomUUID(),
        category: "investment",
        amount: (activeIncome.amount * allocPercentages.investment) / 100,
        toAccount: "acc_003",
        isCompleted: true,
      },
    ];

    allocateIncome(activeIncome.id, allocations);
    setIsAllocModalOpen(false);
    setActiveIncome(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Income Streams
          </h2>
          <p className="text-gray-500 dark:text-white/70 font-medium tracking-tight">
            Managing additional income streams from various sources
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn bg-primary-500 dark:bg-white text-white dark:text-primary-500 hover:opacity-90 shadow-lg shadow-black/10"
        >
          <Plus className="w-5 h-5" />
          Add Additional Income
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sticky Summary */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <Card
            variant="blue"
            className="border-none relative overflow-hidden group shadow-2xl shadow-primary-500/20"
          >
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
            <div className="relative z-10 space-y-8 text-white">
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">
                  Lifetime Earnings
                </p>
                <h3 className="text-4xl font-black">
                  {formatCurrency(totalIncome)}
                </h3>
              </div>
              <div className="pt-6 border-t border-white/20">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                      Yearly Summary
                    </p>
                    <p className="text-xl font-bold">{currentYear}</p>
                  </div>
                  <PieChart className="w-6 h-6 text-white/40" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black">
                    {formatCurrency(yearlyIncome)}
                  </p>
                  <p className="text-xs font-bold text-white/60">
                    {
                      incomes.filter(
                        (i) => new Date(i.date).getFullYear() === currentYear,
                      ).length
                    }{" "}
                    Captured Project/Income
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Allocation Strategy" bodyClassName="px-4 py-5">
            <div className="space-y-4">
              {[
                {
                  label: "Savings",
                  value: "60%",
                  icon: CheckCircle2,
                  color: "emerald",
                  acc: "Seabank",
                },
                {
                  label: "Spending",
                  value: "20%",
                  icon: Zap,
                  color: "orange",
                  acc: "OVO / E-Wallet",
                },
                {
                  label: "Investment",
                  value: "20%",
                  icon: TrendingUp,
                  color: "indigo",
                  acc: "Permata RDN",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="group relative p-4 bg-gray-50/50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-500/30 transition-all duration-500 flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      item.color === "emerald"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : item.color === "orange"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                          : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                        {item.label}
                      </p>
                      <p
                        className={`text-lg font-black leading-none ${
                          item.color === "emerald"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : item.color === "orange"
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        {item.value}
                      </p>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                      {item.acc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Income Log */}
        <Card
          title="Income Log"
          subtitle="All payments received in BRI account"
          className="lg:col-span-8"
          bodyClassName="p-0"
        >
          {incomes.length > 0 ? (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-gray-800">
                    <th className="px-6 pt-6 pb-6 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      Date
                    </th>
                    <th className="px-6 pt-6 pb-6 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      Category
                    </th>
                    <th className="px-6 pt-6 pb-6 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      Source / Note
                    </th>
                    <th className="px-6 pt-6 pb-6 font-black text-[10px] text-gray-400 uppercase tracking-widest text-right">
                      Amount
                    </th>
                    <th className="px-6 pt-6 pb-6 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">
                      Action
                    </th>
                    <th className="px-6 pt-6 pb-6 font-black text-[10px] text-gray-400 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {incomes.map((income) => (
                    <tr
                      key={income.id}
                      className="group/row hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-6 text-sm font-bold text-gray-500">
                        {formatDate(income.date, "short")}
                      </td>
                      <td className="px-6 py-6">
                        <span
                          className={`px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
                            income.category === "Freelance"
                              ? "bg-blue-50 text-blue-500 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20"
                              : income.category === "Bonus"
                                ? "bg-purple-50 text-purple-500 border-purple-100 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-900/20"
                                : income.category === "THR"
                                  ? "bg-amber-50 text-amber-500 border-amber-100 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/20"
                                  : "bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700"
                          }`}
                        >
                          {income.category}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <p className="font-black text-gray-900 dark:text-white tracking-tight">
                          {income.client}
                        </p>
                        <p className="text-xs font-bold text-gray-400">
                          {income.project}
                        </p>
                      </td>
                      <td className="px-6 py-6 text-right font-black text-gray-900 dark:text-white text-lg">
                        {formatCurrency(income.amount)}
                      </td>
                      <td className="px-6 py-6 font-sans">
                        <div className="flex justify-center">
                          {income.status === "allocated" ? (
                            <div className="relative group/tooltip">
                              <span className="cursor-help px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-green-100 dark:border-green-900/20 shadow-sm transition-all hover:bg-green-100 dark:hover:bg-green-900/20">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Allocated
                                <Info className="w-3 h-3 opacity-50" />
                              </span>

                              {/* Tooltip contents */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-gray-900 dark:bg-black rounded-xl shadow-2xl border border-white/10 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-50 pointer-events-none text-left">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 pb-2 border-b border-white/5">
                                  Allocation Breakdown
                                </p>
                                <div className="space-y-3">
                                  {income.allocations.map((alloc) => (
                                    <div
                                      key={alloc.id}
                                      className="flex justify-between items-center text-[11px]"
                                    >
                                      <span className="text-white/60 font-bold capitalize">
                                        {alloc.category}
                                      </span>
                                      <div className="text-right">
                                        <p className="text-white font-black">
                                          {formatCurrency(alloc.amount)}
                                        </p>
                                        <p className="text-primary-400 font-bold text-[9px]">
                                          {Math.round(
                                            (alloc.amount / income.amount) *
                                              100,
                                          )}
                                          %
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 dark:bg-black border-r border-b border-white/10 rotate-45 -mt-1.5"></div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveIncome(income);
                                setIsAllocModalOpen(true);
                              }}
                              className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg  shadow-amber-500/20 transition-all active:scale-95"
                            >
                              <Zap className="w-3.5 h-3.5" /> Allocate
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button
                          onClick={() => deleteIncome(income.id)}
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
              icon={Briefcase}
              title="No entries yet"
              description="Log your additional income manually to track your wealth acceleration."
              className="m-6"
            />
          )}
        </Card>
      </div>

      {/* Add Income Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Additional Income"
      >
        <form onSubmit={handleAddIncome} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                Category
              </label>
              <select
                value={addFormData.category}
                onChange={(e) =>
                  setAddFormData({
                    ...addFormData,
                    category: e.target.value as any,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
              >
                <option value="Freelance">Freelance</option>
                <option value="Bonus">Bonus</option>
                <option value="THR">THR</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                Date
              </label>
              <input
                type="date"
                required
                value={addFormData.date}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, date: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
              Source Name
            </label>
            <input
              type="text"
              required
              value={addFormData.client}
              onChange={(e) =>
                setAddFormData({ ...addFormData, client: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
              placeholder="e.g. Acme Corp or Company THR"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
              Note / Project
            </label>
            <input
              type="text"
              required
              value={addFormData.project}
              onChange={(e) =>
                setAddFormData({ ...addFormData, project: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
              placeholder="e.g. Website Redesign or Year End Bonus"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
              Amount (IDR)
            </label>
            <input
              type="number"
              required
              value={addFormData.amount}
              onChange={(e) =>
                setAddFormData({ ...addFormData, amount: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
              placeholder="0"
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
              Save Income
            </button>
          </div>
        </form>
      </Modal>

      {/* Allocation Modal */}
      <Modal
        isOpen={isAllocModalOpen}
        onClose={() => setIsAllocModalOpen(false)}
        title="Manual Income Allocation"
      >
        {activeIncome && (
          <form onSubmit={handleAllocate} className="space-y-6">
            <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/20 mb-6">
              <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">
                To Allocate
              </p>
              <p className="text-xl font-black text-primary-900 dark:text-primary-100">
                {formatCurrency(activeIncome.amount)}
              </p>
              <p className="text-xs font-bold text-primary-700/60 dark:text-primary-400 mt-1">
                [{activeIncome.category}] {activeIncome.client} -{" "}
                {activeIncome.project}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      Savings
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={allocPercentages.savings}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setAllocPercentages({
                            ...allocPercentages,
                            savings: Math.min(100, val),
                          });
                        }}
                        className="w-12 px-1 py-0.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-right text-xs font-black text-primary-500 outline-none"
                      />
                      <span className="text-[10px] font-black text-gray-400 ml-1">
                        %
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {formatCurrency(
                      (activeIncome.amount * allocPercentages.savings) / 100,
                    )}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={allocPercentages.savings}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setAllocPercentages({ ...allocPercentages, savings: val });
                  }}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      Spending
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={allocPercentages.spending}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setAllocPercentages({
                            ...allocPercentages,
                            spending: Math.min(100, val),
                          });
                        }}
                        className="w-12 px-1 py-0.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-right text-xs font-black text-primary-500 outline-none"
                      />
                      <span className="text-[10px] font-black text-gray-400 ml-1">
                        %
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {formatCurrency(
                      (activeIncome.amount * allocPercentages.spending) / 100,
                    )}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={allocPercentages.spending}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setAllocPercentages({ ...allocPercentages, spending: val });
                  }}
                  className="w-full accent-primary-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      Investment
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={allocPercentages.investment}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setAllocPercentages({
                            ...allocPercentages,
                            investment: Math.min(100, val),
                          });
                        }}
                        className="w-12 px-1 py-0.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-right text-xs font-black text-primary-500 outline-none"
                      />
                      <span className="text-[10px] font-black text-gray-400 ml-1">
                        %
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {formatCurrency(
                      (activeIncome.amount * allocPercentages.investment) / 100,
                    )}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={allocPercentages.investment}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setAllocPercentages({
                      ...allocPercentages,
                      investment: val,
                    });
                  }}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            <div className="pt-6 flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-400">
                  Total Configured
                </span>
                <span
                  className={`font-black ${allocPercentages.savings + allocPercentages.spending + allocPercentages.investment === 100 ? "text-green-500" : "text-red-500"}`}
                >
                  {allocPercentages.savings +
                    allocPercentages.spending +
                    allocPercentages.investment}
                  %
                </span>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsAllocModalOpen(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    allocPercentages.savings +
                      allocPercentages.spending +
                      allocPercentages.investment !==
                    100
                  }
                  className="flex-1 btn btn-primary disabled:opacity-50"
                >
                  Confirm Split
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
