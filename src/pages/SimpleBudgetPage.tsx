import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Trash2,
  Target,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Edit3,
  X,
  ChevronDown,
} from "lucide-react";
import { useSimpleBudgetStore } from "../stores/useSimpleBudgetStore";
import { useSimpleTransactionStore } from "../stores/useSimpleTransactionStore";
import { SimpleBudgetItem } from "../types/simpleBudget";
import { SimpleModeHeader } from "../components/simple-mode/SimpleModeHeader";
import { MonthSelector } from "../components/common/MonthSelector";

interface Config {
  categories: Record<string, string[]>;
  incomeCategories: Record<string, string[]>;
}

const formatRupiah = (val: string) => {
  const num = val.replace(/\D/g, "");
  return num ? Number(num).toLocaleString("id-ID") : "";
};

const parseRupiah = (val: string) => Number(val.replace(/\D/g, "")) || 0;

export const SimpleBudgetPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [config, setConfig] = useState<Config | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SimpleBudgetItem | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    category: "",
    subCategory: "",
    amountRaw: "",
  });

  const { budgets, addBudget, updateBudget, deleteBudget } =
    useSimpleBudgetStore();
  const { transactions } = useSimpleTransactionStore();

  useEffect(() => {
    fetch("/simple-mode-config.json")
      .then((r) => r.json())
      .then(setConfig);
  }, []);

  const subCategories = useMemo(
    () =>
      config && form.category ? (config.categories[form.category] ?? []) : [],
    [config, form.category],
  );

  // Monthly pure income (exclude Switching In)
  const monthlyPureIncome = useMemo(() => {
    const incomes = transactions.filter(
      (t) => t.type === "income" && t.date.startsWith(selectedMonth),
    );
    const switchingIn = incomes
      .filter((t) => t.subCategory === "Switching In")
      .reduce((s, t) => s + t.amount, 0);
    return incomes.reduce((s, t) => s + t.amount, 0) - switchingIn;
  }, [transactions, selectedMonth]);

  // Compute stats per budget item
  const budgetStats = useMemo(
    () =>
      budgets.map((b) => {
        const matching = transactions.filter(
          (t) =>
            (t.type === "expense" || !t.type) &&
            t.date.startsWith(selectedMonth) &&
            t.category === b.category &&
            t.subCategory === b.subCategory,
        );
        const spent = matching.reduce((s, t) => s + t.amount, 0);
        const remaining = b.amount - spent;
        const pctIncome =
          monthlyPureIncome > 0 ? (b.amount / monthlyPureIncome) * 100 : 0;
        const pctUsed =
          b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0;
        return {
          ...b,
          spent,
          remaining,
          pctIncome,
          pctUsed,
          txCount: matching.length,
        };
      }),
    [budgets, transactions, selectedMonth, monthlyPureIncome],
  );

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgetStats.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: "", category: "", subCategory: "", amountRaw: "" });
    setIsModalOpen(true);
  };

  const openEdit = (item: SimpleBudgetItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      subCategory: item.subCategory,
      amountRaw: item.amount.toLocaleString("id-ID"),
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.subCategory || !form.amountRaw)
      return;
    const amount = parseRupiah(form.amountRaw);
    if (editingItem) {
      await updateBudget(editingItem.id, {
        name: form.name,
        category: form.category,
        subCategory: form.subCategory,
        amount,
      });
    } else {
      const newItem: SimpleBudgetItem = {
        id: crypto.randomUUID(),
        name: form.name,
        category: form.category,
        subCategory: form.subCategory,
        amount,
        createdAt: new Date().toISOString(),
      };
      await addBudget(newItem);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-full space-y-6 pb-40 md:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Budget Planner
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Set spending limits per category and track actuals automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
          <button
            onClick={openAdd}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-bold shadow-md shadow-violet-500/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Add Budget</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Budget"
          value={totalBudget}
          sub={`${budgets.length} items`}
          color="violet"
          icon={<Target className="w-6 h-6" />}
        />
        <StatCard
          label="Total Spent"
          value={totalSpent}
          sub={`${((totalBudget > 0 ? totalSpent / totalBudget : 0) * 100).toFixed(1)}% of budget`}
          color="amber"
          icon={<TrendingDown className="w-6 h-6" />}
        />
        <StatCard
          label="Remaining"
          value={Math.abs(totalRemaining)}
          sub={totalRemaining >= 0 ? "Under budget" : "Over budget!"}
          color={totalRemaining >= 0 ? "green" : "red"}
          icon={
            totalRemaining >= 0 ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )
          }
        />
      </div>

      {/* Income reference */}
      {monthlyPureIncome > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20">
          <TrendingUp className="w-4 h-4 text-green-500 shrink-0" />
          <p className="text-xs font-bold text-green-700 dark:text-green-400">
            Pure Income this month:{" "}
            <span className="font-black">
              Rp {monthlyPureIncome.toLocaleString("id-ID")}
            </span>{" "}
            — percentages below are relative to this figure.
          </p>
        </div>
      )}

      {/* Budget List */}
      {budgetStats.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Wallet className="w-4 h-4 text-violet-500" /> Budget Items
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {budgetStats.map((item) => (
              <BudgetCard
                key={item.id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => deleteBudget(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <BudgetModal
          form={form}
          setForm={setForm}
          subCategories={subCategories}
          categories={config ? Object.keys(config.categories) : []}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          isEdit={!!editingItem}
        />
      )}

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-900 z-50">
        <button
          onClick={openAdd}
          className="btn w-full py-4 bg-violet-500 text-white font-black shadow-xl shadow-violet-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Budget</span>
        </button>
      </div>
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: number;
  sub: string;
  color: "violet" | "amber" | "green" | "red";
  icon: React.ReactNode;
}) => (
  <div className="card group relative overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-lg shadow-black/2">
    <div className={`absolute top-0 left-0 w-1.5 h-full bg-${color}-500`} />
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            {label}
          </p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
            Rp {value.toLocaleString("id-ID")}
          </h3>
        </div>
        <div
          className={`w-12 h-12 rounded-2xl bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center text-${color}-500 transition-transform group-hover:scale-110 duration-500`}
        >
          {icon}
        </div>
      </div>
      <p
        className={`text-[10px] font-bold uppercase tracking-wider text-${color}-500`}
      >
        {sub}
      </p>
    </div>
  </div>
);

const BudgetCard = ({
  item,
  onEdit,
  onDelete,
}: {
  item: {
    id: string;
    name: string;
    category: string;
    subCategory: string;
    amount: number;
    spent: number;
    remaining: number;
    pctIncome: number;
    pctUsed: number;
    txCount: number;
  };
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const isOver = item.remaining < 0;
  const barColor =
    item.pctUsed >= 90
      ? "bg-red-500"
      : item.pctUsed >= 70
        ? "bg-amber-500"
        : "bg-violet-500";

  return (
    <div className="card relative overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-sm p-4 transition-all hover:shadow-md">
      {/* Top row: Title and Actions */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-black text-gray-900 dark:text-white truncate">
              {item.name}
            </h3>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 uppercase tracking-tighter">
              {item.category}
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
              {item.subCategory}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats and Progress */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 items-end">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
              Spent
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                Rp {item.spent.toLocaleString("id-ID")}
              </span>
              <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                / {item.amount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <span
              className={`text-[9px] font-black uppercase tracking-widest block ${isOver ? "text-red-400" : "text-green-400"}`}
            >
              {isOver ? "Over Budget" : "Available"}
            </span>
            <p
              className={`text-xl font-black leading-none ${isOver ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
            >
              Rp {Math.abs(item.remaining).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Progress Bar with Floating Badge */}
        <div className="relative pt-4 pb-1 px-4">
          <div className="relative h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full">
            <div
              className={`absolute top-0 left-0 h-full ${barColor} transition-all duration-1000 ease-out rounded-full`}
              style={{ width: `${item.pctUsed}%` }}
            />
            {/* Floating Percentage Indicator */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center w-9 h-6 rounded-full border-2 border-white dark:border-gray-950 ${barColor} text-[8px] font-black text-white shadow-lg transition-all duration-1000 ease-out`}
              style={{ left: `${item.pctUsed}%` }}
            >
              {item.pctUsed.toFixed(0)}%
            </div>
          </div>
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tight mt-3">
            <div className="flex items-center gap-2">
              <span className="text-violet-500">
                {item.pctIncome.toFixed(1)}% of income
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">{item.txCount} transactions</span>
            </div>
            <span className={isOver ? "text-red-500" : "text-gray-500"}>
              {isOver ? "Limit Exceeded ⚠" : "Budget Health: OK"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BudgetModal = ({
  form,
  setForm,
  categories,
  subCategories,
  onClose,
  onSave,
  isEdit,
}: {
  form: {
    name: string;
    category: string;
    subCategory: string;
    amountRaw: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      category: string;
      subCategory: string;
      amountRaw: string;
    }>
  >;
  categories: string[];
  subCategories: string[];
  onClose: () => void;
  onSave: () => void;
  isEdit: boolean;
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const isValid =
    form.name && form.category && form.subCategory && form.amountRaw;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div
        className="relative w-full md:max-w-lg bg-white dark:bg-gray-950 rounded-t-3xl md:rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700 md:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pt-3 md:pt-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Target className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">
              {isEdit ? "Edit Budget" : "Add Budget"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-1 -mr-1 scrollbar-hide space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Name
            </label>
            <input
              type="text"
              placeholder="e.g. Lunch Budget"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Category
            </label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value,
                    subCategory: "",
                  }))
                }
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400 appearance-none transition-all"
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Sub-Category */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Sub Category
            </label>
            <div className="relative">
              <select
                value={form.subCategory}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subCategory: e.target.value }))
                }
                disabled={!form.category}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400 appearance-none transition-all disabled:opacity-50"
              >
                <option value="">Select sub-category…</option>
                {subCategories.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Amount (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={form.amountRaw}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amountRaw: formatRupiah(e.target.value),
                  }))
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!isValid}
            className="flex-1 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm transition-all active:scale-95 shadow-lg shadow-violet-500/20"
          >
            {isEdit ? "Save Changes" : "Add Budget"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
    <div className="w-20 h-20 rounded-3xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
      <Target className="w-10 h-10 text-violet-400" />
    </div>
    <div>
      <h3 className="text-lg font-black text-gray-900 dark:text-white">
        No budgets yet
      </h3>
      <p className="text-sm text-gray-400 font-medium mt-1">
        Create your first budget to start tracking spending against your
        targets.
      </p>
    </div>
    <button
      onClick={onAdd}
      className="flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-bold shadow-md shadow-violet-500/20 transition-all active:scale-95"
    >
      <Plus className="w-4 h-4" />
      Add First Budget
    </button>
  </div>
);
