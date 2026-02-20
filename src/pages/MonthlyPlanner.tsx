import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useBudgetStore } from "../stores/useBudgetStore";
import { useAccountsStore } from "../stores/useAccountsStore";
import { useExpenseStore } from "../stores/useExpenseStore";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { EmptyState } from "../components/common/EmptyState";
import { MonthSelector } from "../components/common/MonthSelector";
import {
  formatCurrency,
  getMonthName,
  formatPercentage,
} from "../utils/formatters";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Wallet,
  Target,
  Edit2,
  Check,
  X,
  AlertCircle,
  Plus,
  Trash2,
  Banknote,
  ChevronRight,
  Copy,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  ALLOCATION_CATEGORIES,
  BANKS,
  MONTHS,
} from "../utils/constants";
import { Allocation } from "../types/budget";
import { Expense, ExpenseCategory } from "../types/expense";

export const MonthlyPlanner = () => {
  const {
    budgets,
    currentBudget,
    completeAllocation,
    updateAllocation,
    addAllocation,
    deleteAllocation,
    updateBudget,
    setCurrentBudget,
    ensureMonthExists,
  } = useBudgetStore();
  const { accounts, getAccountById } = useAccountsStore();
  const { addExpense } = useExpenseStore();

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  // Salary State
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [tempSalary, setTempSalary] = useState("");

  // Allocation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAllocId, setEditingAllocId] = useState<string | null>(null);
  const [modalData, setModalData] = useState({
    category: "other",
    amount: "",
    toAccount: accounts[0]?.id || "",
  });

  // Confirmation Flow State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAlloc, setPendingAlloc] = useState<Allocation | null>(null);

  useEffect(() => {
    const budget = ensureMonthExists(selectedMonth);
    setCurrentBudget(budget);
  }, [selectedMonth, ensureMonthExists, setCurrentBudget]);

  const activeBudget =
    currentBudget ||
    budgets.find((b) => b.month === selectedMonth) ||
    budgets[budgets.length - 1];

  const hasSalaryAccount = useMemo(() => {
    return accounts.some((acc) => acc.isSalaryAccount);
  }, [accounts]);

  if (!activeBudget)
    return (
      <div className="text-gray-900 dark:text-white text-center py-20 font-bold">
        No budget found for {selectedMonth}.
      </div>
    );

  const totalAllocated = activeBudget.allocations.reduce(
    (sum, a) => sum + a.amount,
    0,
  );
  const totalDistributed = activeBudget.allocations
    .filter((a) => a.isCompleted)
    .reduce((sum, a) => sum + a.amount, 0);
  const remainingToAllocate = activeBudget.income.total - totalAllocated;
  const distributionPercentage =
    totalAllocated > 0 ? (totalDistributed / totalAllocated) * 100 : 0;

  const progress =
    activeBudget.allocations.length > 0
      ? (activeBudget.allocations.filter((a) => a.isCompleted).length /
          activeBudget.allocations.length) *
        100
      : 0;

  // Handlers
  const handleToggleAllocation = (allocationId: string) => {
    const alloc = activeBudget.allocations.find((a) => a.id === allocationId);
    if (alloc?.isCompleted) {
      // Once completed, it cannot be unchecked to maintain accounting integrity
      return;
    } else if (alloc) {
      // Checking: open confirmation flow
      setPendingAlloc(alloc);
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmAllocation = () => {
    if (!pendingAlloc || !activeBudget) return;

    // 1. Find Primary Salary Account
    const salaryAcc = accounts.find((acc) => acc.isSalaryAccount);
    if (!salaryAcc) {
      alert(
        "No Primary Salary account found. Please designate one in Liquid Assets first.",
      );
      setIsConfirmModalOpen(false);
      return;
    }

    // 2. Create Automated Expense
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      amount: pendingAlloc.amount,
      category: pendingAlloc.category as ExpenseCategory,
      accountId: salaryAcc.id,
      accountType: "bank",
      note: "Monthly Allocation",
      type: "allocation",
      createdAt: new Date().toISOString(),
    };

    addExpense(newExpense);

    // 3. Update Balances (Skip if Source == Target)
    if (salaryAcc.id !== pendingAlloc.toAccount) {
      // Deduct from Salary
      useAccountsStore.getState().updateAccount(salaryAcc.id, {
        balance: salaryAcc.balance - pendingAlloc.amount,
      });

      // Add to Target
      const targetAcc = accounts.find(
        (acc) => acc.id === pendingAlloc.toAccount,
      );
      if (targetAcc) {
        useAccountsStore.getState().updateAccount(targetAcc.id, {
          balance: targetAcc.balance + pendingAlloc.amount,
        });
      }
    }

    // 4. Mark Allocation as Complete
    completeAllocation(activeBudget.id, pendingAlloc.id);

    // 5. Cleanup
    setIsConfirmModalOpen(false);
    setPendingAlloc(null);
  };

  const getAccountLabel = (toAccount: string) => {
    const account = getAccountById(toAccount);
    if (account) {
      return `${account.bank} - ${account.name}`;
    }
    return toAccount;
  };

  const handleSaveSalary = () => {
    const amount = parseInt(tempSalary);
    if (isNaN(amount) || amount < 0) return;
    updateBudget(activeBudget.id, {
      income: {
        ...activeBudget.income,
        salary: amount,
        total:
          amount + activeBudget.income.freelance + activeBudget.income.other,
      },
    });
    setIsEditingSalary(false);
  };

  const openAddModal = () => {
    setEditingAllocId(null);
    setModalData({
      category: "other",
      amount: "",
      toAccount: accounts[0]?.id || "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (alloc: Allocation) => {
    setEditingAllocId(alloc.id);
    setModalData({
      category: alloc.category,
      amount: alloc.amount.toString(),
      toAccount: alloc.toAccount,
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(modalData.amount);
    if (isNaN(amount) || amount <= 0) return;

    if (editingAllocId) {
      updateAllocation(activeBudget.id, editingAllocId, {
        category: modalData.category as any,
        amount,
        toAccount: modalData.toAccount,
      });
    } else {
      const newAlloc: Allocation = {
        id: crypto.randomUUID(),
        category: modalData.category as any,
        amount,
        toAccount: modalData.toAccount,
        isCompleted: false,
        completedAt: null,
      };
      addAllocation(activeBudget.id, newAlloc);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Budget Strategy
          </h2>
          <p className="text-gray-500 dark:text-white/70 font-medium">
            Manage your salary distributions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
          <button
            onClick={openAddModal}
            className="btn bg-primary-500 dark:bg-white text-white dark:text-primary-500 hover:opacity-90 shadow-xl shadow-black/10"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>
      </div>

      {!hasSalaryAccount && accounts.length > 0 && (
        <Link
          to="/buckets"
          className="block transform active:scale-[0.99] transition-transform"
        >
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/20 flex items-center gap-4 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight">
                Action Required: Missing Salary Account
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-200/50 mt-0.5 font-medium leading-relaxed">
                Click here to designate one of your buckets as the **Primary
                Salary Account**. This is required for automated budget
                distribution.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400" />
          </div>
        </Link>
      )}

      {/* Warning Alert */}
      {remainingToAllocate < 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/20 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-red-900 dark:text-red-100 uppercase tracking-tight">
              Over-Allocation Warning
            </p>
            <p className="text-xs text-red-800/80 dark:text-red-200/50 mt-0.5 font-medium leading-relaxed">
              Total allocations exceed salary by{" "}
              {formatCurrency(Math.abs(remainingToAllocate))}.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Allocation Checklist Card */}
        <div className="lg:col-span-2 lg:order-last space-y-6">
          <Card
            title="Distribution Checklist"
            subtitle="Track and manage allocations"
            action={
              activeBudget.allocations.length === 0 && (
                <button
                  onClick={() => {
                    const prevIdx = MONTHS.indexOf(selectedMonth) - 1;
                    if (prevIdx >= 0) {
                      useBudgetStore
                        .getState()
                        .duplicateAllocationsFromMonth(
                          MONTHS[prevIdx],
                          selectedMonth,
                        );
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  <Copy className="w-4 h-4" /> Import from Prev Month
                </button>
              )
            }
          >
            <div className="space-y-4">
              {activeBudget.allocations.length > 0 ? (
                activeBudget.allocations.map((alloc) => (
                  <div
                    key={alloc.id}
                    className={`group flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${
                      alloc.isCompleted
                        ? "bg-green-50/50 dark:bg-green-900/5 border-green-100 dark:border-green-900/20"
                        : "bg-white dark:bg-gray-900 border-gray-50 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => handleToggleAllocation(alloc.id)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          alloc.isCompleted
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                            : "bg-gray-100 dark:bg-gray-900 text-gray-400 hover:bg-primary-500 hover:text-white"
                        }`}
                      >
                        {alloc.isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>
                      <div>
                        <p
                          className={`font-bold tracking-tight ${alloc.isCompleted ? "text-green-900 dark:text-green-100 line-through" : "text-gray-900 dark:text-white"}`}
                        >
                          {CATEGORY_LABELS[alloc.category] || alloc.category}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-black text-primary-500 bg-primary-50 px-2 py-0.5 rounded uppercase">
                            {formatPercentage(
                              alloc.amount / activeBudget.income.total,
                            )}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            Acc: {getAccountLabel(alloc.toAccount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p
                            className={`text-lg font-black ${alloc.isCompleted ? "text-green-600" : "text-gray-900 dark:text-white"}`}
                          >
                            {formatCurrency(alloc.amount)}
                          </p>
                          {!alloc.isCompleted && (
                            <div className="flex items-center justify-end gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(alloc)}
                                className="text-[10px] font-black text-gray-300 hover:text-primary-500 uppercase flex items-center gap-1"
                              >
                                <Edit2 className="w-2.5 h-2.5" /> Edit
                              </button>
                              <button
                                onClick={() =>
                                  deleteAllocation(activeBudget.id, alloc.id)
                                }
                                className="text-[10px] font-black text-gray-300 hover:text-red-500 uppercase flex items-center gap-1"
                              >
                                <Trash2 className="w-2.5 h-2.5" /> Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Banknote}
                  title="No allocations added for this month"
                  description="Start by adding a new allocation item or import from the previous month."
                />
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8 lg:order-first">
          <Card variant="blue" className="relative group overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/70 text-sm font-bold uppercase mb-1">
                    Monthly Salary (BCA)
                  </p>
                  {isEditingSalary ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={tempSalary}
                        onChange={(e) => setTempSalary(e.target.value)}
                        className="w-40 bg-white/20 border-b-2 border-white text-white text-2xl font-black outline-none py-1"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveSalary}
                        className="p-1 bg-white/20 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-4xl font-black text-white">
                        {formatCurrency(activeBudget.income.total)}
                      </h3>
                      <button
                        onClick={() => {
                          setIsEditingSalary(true);
                          setTempSalary(activeBudget.income.salary.toString());
                        }}
                        className="p-1 hover:bg-white/10 rounded-lg text-white/50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/20">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 font-bold">Planned</span>
                  <span className="font-black text-white">
                    {formatCurrency(totalAllocated)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 font-bold">Distributed</span>
                  <span className="font-black text-green-300">
                    {formatCurrency(totalDistributed)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 font-bold">Unallocated</span>
                  <span
                    className={`font-black ${remainingToAllocate < 0 ? "text-red-300" : "text-white/40"}`}
                  >
                    {formatCurrency(remainingToAllocate)}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, distributionPercentage)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-[10px] text-white/50 font-black uppercase tracking-widest mt-2">
                  {Math.round(distributionPercentage)}% Actually Distributed
                </p>
              </div>
            </div>
          </Card>

          <Card title="Quick Guidelines">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-500 shrink-0">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  Adjust your monthly salary if it changes. Use the month
                  selector to plan for Feb 2026 onwards.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  A credit card buffer is essential for high-spending months
                  like religious holidays or travel.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Allocation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Distribution"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/20">
            <div className="w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
                Amount to Distribute
              </p>
              <p className="text-xl font-black text-primary-900 dark:text-primary-100">
                {pendingAlloc ? formatCurrency(pendingAlloc.amount) : "-"}
              </p>
            </div>
          </div>

          <div className="space-y-3 px-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 font-bold">Category</span>
              <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {pendingAlloc
                  ? CATEGORY_LABELS[pendingAlloc.category] ||
                    pendingAlloc.category
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 font-bold">Target Bucket</span>
              <span className="font-black text-gray-900 dark:text-white">
                {pendingAlloc ? getAccountLabel(pendingAlloc.toAccount) : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 font-bold">
                Paid From (Salary)
              </span>
              <span className="font-black text-primary-500">
                {accounts.find((a) => a.isSalaryAccount)?.name || "Not Found"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
            <p className="text-[10px] text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
              Confirming will automatically record an expense and deduct the
              balance from your primary salary account. Distributed items cannot
              be edited or deleted.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAllocation}
              className="flex-1 btn btn-primary"
            >
              Yes, Distribute
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAllocId ? "Edit Allocation" : "New Allocation Item"}
      >
        <form onSubmit={handleSaveModal} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">
              Category
            </label>
            <select
              value={modalData.category}
              onChange={(e) =>
                setModalData({ ...modalData, category: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all"
            >
              {ALLOCATION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] || cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">
              Amount (IDR)
            </label>
            <input
              type="number"
              placeholder="e.g. 1000000"
              value={modalData.amount}
              onChange={(e) =>
                setModalData({ ...modalData, amount: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">
              Target Account
            </label>
            <select
              value={modalData.toAccount}
              onChange={(e) =>
                setModalData({ ...modalData, toAccount: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all"
              required
            >
              <option value="" disabled>
                Select a bucket
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.bank} - {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn btn-primary">
              Save Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
