import { useState } from "react";
import { useFreelanceStore } from "../stores/useFreelanceStore";
import { useAccountsStore } from "../stores/useAccountsStore";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { EmptyState } from "../components/common/EmptyState";
import { SelectInput } from "../components/common/SelectInput";
import { CurrencyInput } from "../components/common/CurrencyInput";
import { RowActions } from "../components/common/RowActions";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
  Briefcase,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Save,
  PieChart,
  Info,
  TrendingUp,
  Trash2,
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
  const totalProjects = incomes.length;
  const avgIncome = totalProjects > 0 ? totalIncome / totalProjects : 0;

  const currentYear = new Date().getFullYear();
  const yearlyIncomes = incomes.filter((i) => new Date(i.date).getFullYear() === currentYear);
  const yearlyIncomeTotal = yearlyIncomes.reduce((sum, i) => sum + i.amount, 0);
  const yearlyCount = yearlyIncomes.length;
  
  // Calculate monthly average for current year (count months passed or 12)
  const currentMonth = new Date().getMonth() + 1;
  const monthlyAvg = yearlyIncomeTotal / currentMonth;

  const pendingAllocations = incomes.filter(i => i.status === "pending").length;
  const completedAllocations = incomes.filter(i => i.status === "completed").length;

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
    <div className="space-y-6 animate-in slide-in-from-left-4 duration-700 pb-28 md:pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Income Streams
          </h2>
          <p className="text-gray-500 dark:text-white/70 font-medium tracking-tight text-sm">
            Managing additional income streams from various sources
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="hidden md:flex btn bg-primary-500 dark:bg-white text-white dark:text-primary-500 hover:opacity-90 shadow-lg shadow-black/10"
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
            <div className="relative z-10 space-y-6 text-white">
              <div className="space-y-1">
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                  Lifetime Earnings
                </p>
                <h3 className="text-3xl md:text-4xl font-black tracking-tight">
                  {formatCurrency(totalIncome)}
                </h3>
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-lg text-[9px] font-bold">
                    <Briefcase className="w-3 h-3" /> {totalProjects} Projects
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-lg text-[9px] font-bold">
                    <TrendingUp className="w-3 h-3" /> {formatCurrency(avgIncome)} / avg
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/20">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                      Yearly Growth
                    </p>
                    <p className="text-xl font-bold">{currentYear}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-white/50 uppercase">Monthly Avg</p>
                    <p className="text-sm font-black">{formatCurrency(monthlyAvg)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-black">
                      {formatCurrency(yearlyIncomeTotal)}
                    </p>
                    <p className="text-[10px] font-bold text-white/60">
                      {yearlyCount} Entries
                    </p>
                  </div>
                  
                  {/* Progress towards year end */}
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-white h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(currentMonth / 12) * 100}%` }}
                    />
                  </div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                    Year Progress: {Math.round((currentMonth / 12) * 100)}% ({currentMonth}/12 Months)
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Allocation Strategy" bodyClassName="p-4 sm:p-5">
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl p-3">
                <p className="text-orange-500/60 text-[8px] font-black uppercase mb-1">Pending</p>
                <p className="text-xl font-black text-orange-600 dark:text-orange-400">{pendingAllocations}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl p-3">
                <p className="text-emerald-500/60 text-[8px] font-black uppercase mb-1">Allocated</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{completedAllocations}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
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
                  color: "primary",
                  acc: "Permata RDN",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="group relative p-3 sm:p-4 bg-gray-50/50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-500/30 transition-all duration-500 flex items-center gap-3 sm:gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      item.color === "emerald"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : item.color === "orange"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                          : "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
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
                              : "text-primary-600 dark:text-primary-400"
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
            <div className="flex flex-col">
              {/* Mobile View: Card List */}
              <div className="md:hidden divide-y divide-gray-50 dark:divide-gray-800">
                {incomes.map((income) => (
                  <div key={income.id} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {formatDate(income.date, "short")}
                        </span>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-gray-900 dark:text-white leading-tight">
                            {income.client}
                          </p>
                          <span
                            className={`px-1.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${
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
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">
                          {income.project}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900 dark:text-white">
                          {formatCurrency(income.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        {income.status === "allocated" ? (
                          <div className="relative group/tooltip">
                            <span className="cursor-help px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-green-100 dark:border-green-900/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Allocated
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveIncome(income);
                              setIsAllocModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                          >
                            <Zap className="w-3 h-3" /> Allocate
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => deleteIncome(income.id)}
                        className="p-2 rounded-lg text-gray-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-x-auto no-scrollbar">
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
                        <td className="px-6 py-4 text-right">
                          <RowActions onDelete={() => deleteIncome(income.id)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <SelectInput
                value={addFormData.category}
                onChange={(e) =>
                  setAddFormData({
                    ...addFormData,
                    category: e.target.value as any,
                  })
                }
                className="px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
              >
                <option value="Freelance">Freelance</option>
                <option value="Bonus">Bonus</option>
                <option value="THR">THR</option>
                <option value="Other">Other</option>
              </SelectInput>
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
              Amount
            </label>
            <CurrencyInput
              required
              value={addFormData.amount}
              onChange={(val) =>
                setAddFormData({ ...addFormData, amount: val })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all font-sans"
              placeholder="Rp 0"
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

            <div className="space-y-3">
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
                        className="w-12 px-1 py-0.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-950 text-right text-xs font-black text-primary-500 outline-none"
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
                  className="w-full accent-primary-500 cursor-pointer border-none bg-transparent"
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
                        className="w-12 px-1 py-0.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-950 text-right text-xs font-black text-primary-500 outline-none"
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
                  className="w-full accent-primary-500 cursor-pointer border-none bg-transparent"
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
                        className="w-12 px-1 py-0.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-950 text-right text-xs font-black text-primary-500 outline-none"
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
                  className="w-full accent-primary-500 cursor-pointer border-none bg-transparent"
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
 
      {/* Sticky Mobile Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 z-40">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn w-full bg-primary-500 dark:bg-white text-white dark:text-primary-500 shadow-xl shadow-primary-500/20 py-4 font-black"
        >
          <Plus className="w-5 h-5" />
          Add Additional Income
        </button>
      </div>
    </div>
  );
};
