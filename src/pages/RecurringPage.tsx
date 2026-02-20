import { useState, useMemo } from "react";
import { useRecurringStore } from "../stores/useRecurringStore";
import { useAccountsStore } from "../stores/useAccountsStore";
import { useCreditCardStore } from "../stores/useCreditCardStore";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { EmptyState } from "../components/common/EmptyState";
import { MonthSelector } from "../components/common/MonthSelector";
import { formatCurrency, getMonthName } from "../utils/formatters";
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Wallet,
  Zap,
  Home,
  Droplets,
  Smartphone,
  ShieldCheck,
  Banknote,
  Copy,
} from "lucide-react";
import { RecurringTransaction, RecurringFrequency } from "../types/recurring";
import { MONTHS } from "../utils/constants";

const FREQUENCIES: RecurringFrequency[] = ["monthly", "yearly", "weekly"];
const CATEGORIES = [
  "Subscription",
  "Utilities",
  "Rent",
  "Insurance",
  "Loan",
  "Other",
];

export const RecurringPage = () => {
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    postTransaction,
  } = useRecurringStore();
  const { accounts } = useAccountsStore();
  const { cards } = useCreditCardStore();

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPostConfirmOpen, setIsPostConfirmOpen] = useState(false);
  const [pendingPostId, setPendingPostId] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "Subscription",
    frequency: "monthly" as RecurringFrequency,
    dueDay: "1",
    accountId: "",
    note: "",
  });

  const filteredSubs = useMemo(() => {
    return subscriptions.filter((s) => s.month === selectedMonth);
  }, [subscriptions, selectedMonth]);

  const stats = useMemo(() => {
    const totalMonthly = filteredSubs
      .filter((s) => s.isActive && s.frequency === "monthly")
      .reduce((sum, s) => sum + s.amount, 0);

    const pendingThisMonth = filteredSubs.filter(
      (s) => s.isActive && s.lastPosted !== selectedMonth,
    ).length;

    return { totalMonthly, pendingThisMonth };
  }, [filteredSubs, selectedMonth]);

  const handleEdit = (sub: RecurringTransaction) => {
    setEditingId(sub.id);
    setFormData({
      name: sub.name,
      amount: sub.amount.toString(),
      category: sub.category,
      frequency: sub.frequency,
      dueDay: sub.dueDay.toString(),
      accountId: sub.accountId,
      note: sub.note || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(formData.amount);
    const dayNum = parseInt(formData.dueDay);
    if (isNaN(amountNum) || isNaN(dayNum) || !formData.accountId) return;

    const isBank = accounts.some((a) => a.id === formData.accountId);

    const payload: any = {
      name: formData.name,
      amount: amountNum,
      category: formData.category,
      frequency: formData.frequency,
      dueDay: dayNum,
      accountId: formData.accountId,
      accountType: isBank ? "bank" : "credit_card",
      note: formData.note,
      isActive: true,
      month: selectedMonth,
    };

    if (editingId) {
      updateSubscription(editingId, payload);
    } else {
      addSubscription({
        ...payload,
        id: crypto.randomUUID(),
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      amount: "",
      category: "Subscription",
      frequency: "monthly",
      dueDay: "1",
      accountId: "",
      note: "",
    });
  };

  const handleConfirmPost = () => {
    if (!pendingPostId) return;
    postTransaction(pendingPostId, selectedMonth);
    setIsPostConfirmOpen(false);
    setPendingPostId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Recurring Ledger
          </h2>
          <p className="text-gray-500 dark:text-white/70 font-medium">
            Automate your fixed monthly obligations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
          <button
            onClick={() => {
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="btn bg-primary-500 dark:bg-white text-white dark:text-primary-500 hover:opacity-90 shadow-xl shadow-black/10"
          >
            <Plus className="w-5 h-5" />
            Add Recurring
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sticky Summary */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <Card
            variant="blue"
            className="border-none relative overflow-hidden group shadow-2xl shadow-primary-500/20"
            bodyClassName="p-8"
          >
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
            <div className="relative z-10 text-white">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">
                Estimated Monthly Fix
              </p>
              <h3 className="text-4xl font-black tracking-tight">
                {formatCurrency(stats.totalMonthly)}
              </h3>
              <div className="mt-6 pt-6 border-t border-white/20 flex gap-4">
                <div>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">
                    Active
                  </p>
                  <p className="text-xl font-black">{filteredSubs.length}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">
                    Pending
                  </p>
                  <p className="text-xl font-black">
                    {stats.pendingThisMonth} Units
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col justify-center" bodyClassName="p-8">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${stats.pendingThisMonth > 0 ? "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20" : "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/20"}`}
              >
                {stats.pendingThisMonth > 0 ? (
                  <AlertCircle className="w-7 h-7" />
                ) : (
                  <CheckCircle2 className="w-7 h-7" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900 dark:text-white capitalize tracking-tight">
                  Status Check
                </h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {stats.pendingThisMonth > 0
                    ? `${stats.pendingThisMonth} bills to post`
                    : "All clear for this month"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Ledger List */}
        <div className="lg:col-span-8">
          <Card
            title="Recurring Registry"
            subtitle={`Monthly templates for ${getMonthName(selectedMonth)}`}
            className="shadow-sm"
            action={
              filteredSubs.length === 0 && (
                <button
                  onClick={() => {
                    const prevIdx = MONTHS.indexOf(selectedMonth) - 1;
                    if (prevIdx >= 0) {
                      useRecurringStore
                        .getState()
                        .duplicateFromMonth(MONTHS[prevIdx], selectedMonth);
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
              {filteredSubs.map((sub) => (
                <div
                  key={sub.id}
                  className={`relative group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:border-primary-200`}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                        sub.category === "Subscription"
                          ? "bg-blue-50 text-blue-500 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20"
                          : sub.category === "Utilities"
                            ? "bg-amber-50 text-amber-500 border-amber-100 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/20"
                            : sub.category === "Rent"
                              ? "bg-purple-50 text-purple-500 border-purple-100 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-900/20"
                              : sub.category === "Insurance"
                                ? "bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20"
                                : sub.category === "Loan"
                                  ? "bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/20"
                                  : "bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800"
                      }`}
                    >
                      {sub.category === "Subscription" && (
                        <Smartphone className="w-7 h-7" />
                      )}
                      {sub.category === "Utilities" && (
                        <Droplets className="w-7 h-7" />
                      )}
                      {sub.category === "Rent" && <Home className="w-7 h-7" />}
                      {sub.category === "Insurance" && (
                        <ShieldCheck className="w-7 h-7" />
                      )}
                      {sub.category === "Loan" && (
                        <Banknote className="w-7 h-7" />
                      )}
                      {!Object.keys({
                        Subscription: 1,
                        Utilities: 1,
                        Rent: 1,
                        Insurance: 1,
                        Loan: 1,
                      }).includes(sub.category) && (
                        <Calendar className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-gray-900 dark:text-white text-lg tracking-tight leading-none">
                          {sub.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[8px] font-black uppercase text-gray-500 tracking-widest border border-gray-200 dark:border-gray-700">
                          {sub.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Day {sub.dueDay}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {sub.accountType === "bank" ? (
                            <Wallet className="w-3 h-3 text-primary-500" />
                          ) : (
                            <CreditCard className="w-3 h-3 text-purple-500" />
                          )}
                          {accounts.find((a) => a.id === sub.accountId)?.name ||
                            cards.find((c) => c.id === sub.accountId)?.bank ||
                            "Account"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Amount
                      </p>
                      <p className="text-xl font-black text-gray-900 dark:text-white">
                        {formatCurrency(sub.amount)}
                      </p>
                    </div>

                    {sub.lastPosted === selectedMonth ? (
                      <div className="px-5 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/10 text-green-600 flex items-center gap-2 border border-green-100 dark:border-green-900/20">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Posted
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setPendingPostId(sub.id);
                          setIsPostConfirmOpen(true);
                        }}
                        className="btn btn-primary bg-primary-500 text-white shadow-lg shadow-primary-500/20 px-6 py-2.5 rounded-xl flex items-center gap-2 active:scale-95 transition-all"
                      >
                        <Zap className="w-4 h-4" />
                        Post
                      </button>
                    )}

                    <div className="flex gap-1">
                      {sub.lastPosted !== selectedMonth && (
                        <>
                          <button
                            onClick={() => handleEdit(sub)}
                            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-primary-500 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSubscription(sub.id)}
                            className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-gray-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredSubs.length === 0 && (
                <EmptyState
                  icon={Zap}
                  title="No recurring transactions for this month"
                  description="Add your first recurring payment or import templates from the previous month."
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Modify Recurring" : "New Recurring Transaction"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                Name / Description
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold outline-none focus:border-primary-500"
                placeholder="e.g. Netflix"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                Amount (IDR)
              </label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold outline-none focus:border-primary-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold outline-none focus:border-primary-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                Due Day (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={formData.dueDay}
                onChange={(e) =>
                  setFormData({ ...formData, dueDay: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
              Paid From
            </label>
            <select
              required
              value={formData.accountId}
              onChange={(e) =>
                setFormData({ ...formData, accountId: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold outline-none focus:border-primary-500"
            >
              <option value="">Select Account</option>
              <optgroup label="Bank Accounts">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.bank}: {a.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Credit Cards">
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.bank} (**** {c.lastFourDigits})
                  </option>
                ))}
              </optgroup>
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
              Save Template
            </button>
          </div>
        </form>
      </Modal>

      {/* Post Confirmation Modal */}
      <Modal
        isOpen={isPostConfirmOpen}
        onClose={() => setIsPostConfirmOpen(false)}
        title="Confirm Recurring Post"
      >
        <div className="space-y-6">
          {pendingPostId &&
            subscriptions.find((s) => s.id === pendingPostId) && (
              <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/20">
                <div className="w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
                    Posting Obligation
                  </p>
                  <p className="text-xl font-black text-primary-900 dark:text-primary-100">
                    {formatCurrency(
                      subscriptions.find((s) => s.id === pendingPostId)!.amount,
                    )}
                  </p>
                </div>
              </div>
            )}

          <div className="space-y-3 px-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 font-bold">Template</span>
              <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-right">
                {pendingPostId &&
                  subscriptions.find((s) => s.id === pendingPostId)?.name}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 font-bold">Billing Month</span>
              <span className="font-black text-gray-900 dark:text-white">
                {getMonthName(selectedMonth)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 font-bold">Deducted From</span>
              <span className="font-black text-primary-500">
                {pendingPostId &&
                  (accounts.find(
                    (a) =>
                      a.id ===
                      subscriptions.find((s) => s.id === pendingPostId)
                        ?.accountId,
                  )?.name ||
                    cards.find(
                      (c) =>
                        c.id ===
                        subscriptions.find((s) => s.id === pendingPostId)
                          ?.accountId,
                    )?.bank ||
                    "Unknown Account")}
              </span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
            <p className="text-[10px] text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
              Confirming will automatically record a transaction for this month.
              After posting, this data cannot be edited or deleted.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setIsPostConfirmOpen(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPost}
              className="flex-1 btn btn-primary"
            >
              Yes, Post Now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
