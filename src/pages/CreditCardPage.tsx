import { useState } from "react";
import { useCreditCardStore } from "../stores/useCreditCardStore";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { EmptyState } from "../components/common/EmptyState";
import {
  formatCurrency,
  formatPercentage,
  formatDate,
} from "../utils/formatters";
import {
  CreditCard as CardIcon,
  Calendar,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Zap,
  Edit2,
  Clock,
} from "lucide-react";
import { CreditCardTransaction } from "../types/creditCard";

export const CreditCardPage = () => {
  const { cards, updateCard, addCard, addTransaction, markStatementPaid } =
    useCreditCardStore();
  const card = cards[0]; // Requirement: 1 card only (Mandiri)

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    cardName: card?.cardName || "Mandiri Platinum",
    creditLimit: card?.creditLimit || 50000000,
    statementDate: card?.billingCycle.statementDate || 20,
    dueDate: card?.billingCycle.dueDate || 5,
  });

  // Usage Modal State
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [usageData, setUsageData] = useState({
    amount: "",
    merchant: "",
    category: "General",
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (card) {
      updateCard(card.id, {
        cardName: profileData.cardName,
        creditLimit: profileData.creditLimit,
        billingCycle: {
          statementDate: profileData.statementDate,
          dueDate: profileData.dueDate,
        },
      });
    } else {
      // Setup new card logic
      const newCard = {
        id: crypto.randomUUID(),
        bank: "Mandiri",
        cardName: profileData.cardName,
        lastFourDigits: "0000",
        creditLimit: profileData.creditLimit,
        billingCycle: {
          statementDate: profileData.statementDate,
          dueDate: profileData.dueDate,
        },
        statements: [],
        currentMonth: {
          spent: 0,
          availableCredit: profileData.creditLimit,
          utilizationRate: 0,
          transactions: [],
        },
      };
      addCard(newCard);
    }
    setIsProfileModalOpen(false);
  };

  const handleAddUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;
    const amount = parseInt(usageData.amount);
    if (isNaN(amount) || amount <= 0) return;

    const newTransaction: CreditCardTransaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      merchant: usageData.merchant || "General Merchant",
      category: usageData.category,
      amount: amount,
    };

    addTransaction(card.id, newTransaction);
    setIsUsageModalOpen(false);
    setUsageData({ amount: "", merchant: "", category: "General" });
  };

  const isNearDueDate = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-700">
      {!card ? (
        <EmptyState
          icon={CardIcon}
          title="No Credit Card Configured"
          description="Please initialize your primary credit card profile."
          className="py-20"
          action={
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="btn btn-primary px-8 font-black uppercase tracking-widest text-xs rounded-xl transition-all"
            >
              Setup New Card
            </button>
          }
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {card.cardName}
              </h2>
              <p className="text-gray-500 dark:text-white/70 font-medium">
                Assume full payment every month
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="btn bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-white hover:bg-primary-100 dark:hover:bg-white/20 shadow-lg  border border-primary-100 dark:border-white/10"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={() => setIsUsageModalOpen(true)}
                className="btn bg-primary-500 dark:bg-white text-white dark:text-primary-500 hover:opacity-90 shadow-lg  shadow-black/10"
              >
                <Zap className="w-4 h-4" />
                Input Usage
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card
                key={card.id}
                className="p-0 border-none overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                {/* Modern Card Visual */}
                <div className="relative h-64 bg-gradient-to-br from-gray-900 to-black p-6 flex flex-col justify-between group overflow-hidden rounded-xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                  <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-white/20 rounded-md backdrop-blur-sm border border-white/20"></div>
                      <span className="text-white text-xs font-black uppercase tracking-widest bg-primary-500 px-3 py-1 rounded-full shadow-lg ">
                        {card.bank.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-white/20 font-black text-4xl italic tracking-tighter">
                      {card.cardName.split(" ")[1] || "VISA"}
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col gap-1">
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                      {card.cardName}
                    </p>
                    <p className="text-2xl text-white font-mono tracking-[0.2em] flex gap-4">
                      <span>****</span> <span>****</span> <span>****</span>{" "}
                      <span className="text-primary-400">
                        {card.lastFourDigits}
                      </span>
                    </p>
                  </div>

                  <div className="relative z-10 flex justify-between items-end">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-white/30 text-[8px] font-black uppercase mb-1 whitespace-nowrap">
                          Statement Date
                        </p>
                        <p className="text-sm text-white font-bold">
                          {card.billingCycle.statementDate}th of month
                        </p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[8px] font-black uppercase mb-1 whitespace-nowrap">
                          Due Date
                        </p>
                        <p className="text-sm text-white font-bold">
                          {card.billingCycle.dueDate}th of next month
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/30 text-[8px] font-black uppercase mb-1">
                        Expires
                      </p>
                      <p className="text-sm text-white font-bold">05/28</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-gray-900 text-gray-900">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Current Cycle Usage
                      </p>
                      <p className="text-2xl font-black dark:text-white">
                        {formatCurrency(card.currentMonth.spent)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Remaining Limit
                      </p>
                      <p className="text-2xl font-black text-primary-500">
                        {formatCurrency(card.currentMonth.availableCredit)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Limit Utilization
                      </p>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-2xl font-black ${card.currentMonth.utilizationRate > 0.3 ? "text-amber-500" : "dark:text-white"}`}
                        >
                          {formatPercentage(card.currentMonth.utilizationRate)}
                        </p>
                        <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${card.currentMonth.utilizationRate > 0.3 ? "bg-amber-500" : "bg-primary-500"}`}
                            style={{
                              width: `${Math.min(100, card.currentMonth.utilizationRate * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Usage Activity */}
                  <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">
                        Recent Usage Activity
                      </h4>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        Current Statement Cycle
                      </p>
                    </div>

                    <div className="space-y-3">
                      {card.currentMonth.transactions &&
                      card.currentMonth.transactions.length > 0 ? (
                        card.currentMonth.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-xl group border border-transparent hover:bg-white dark:hover:bg-gray-900 hover:border-gray-100 dark:hover:border-gray-800 transition-all shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm text-gray-400 font-black text-xs">
                                {tx.merchant.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {tx.merchant}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {tx.category} • {formatDate(tx.date, "short")}
                                </p>
                              </div>
                            </div>
                            <p className="font-black text-sm text-gray-900 dark:text-white">
                              {formatCurrency(tx.amount)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <EmptyState
                          icon={Clock}
                          title="No transactions recorded this cycle"
                          className="py-10"
                        />
                      )}
                    </div>
                  </div>

                  {/* Billing History Section */}
                  <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">
                        Billing Statement History
                      </h4>
                      <button className="text-primary-500 text-xs font-bold flex items-center gap-1">
                        View Full History <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {card.statements.length > 0 ? (
                        card.statements.map((stmt) => {
                          const isNear =
                            isNearDueDate(stmt.dueDate) && !stmt.isPaid;
                          return (
                            <div
                              key={stmt.id}
                              className={`flex items-center justify-between p-5 rounded-xl group transition-all border ${
                                isNear
                                  ? "bg-red-50 dark:bg-red-900/5 border-red-100 dark:border-red-900/20 shadow-lg  shadow-red-500/5"
                                  : "bg-gray-50 dark:bg-gray-950 border-transparent hover:bg-gray-100 dark:hover:bg-gray-900"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
                                    isNear
                                      ? "bg-red-500 text-white"
                                      : "bg-white dark:bg-gray-800 text-gray-400 group-hover:text-primary-500"
                                  }`}
                                >
                                  {isNear ? (
                                    <Clock className="w-6 h-6 animate-pulse" />
                                  ) : (
                                    <Calendar className="w-6 h-6" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    Bill for {stmt.month}
                                    {isNear && (
                                      <span className="text-[10px] font-black uppercase text-red-500 bg-red-100 px-2 py-0.5 rounded animate-bounce">
                                        Due Soon
                                      </span>
                                    )}
                                  </p>
                                  <p
                                    className={`text-xs font-bold ${isNear ? "text-red-500" : "text-gray-400"}`}
                                  >
                                    Due: {stmt.dueDate}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="font-black text-gray-900 dark:text-white">
                                    {formatCurrency(stmt.totalSpent)}
                                  </p>
                                  <span
                                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${stmt.isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                                  >
                                    {stmt.isPaid ? "Paid" : "Unpaid"}
                                  </span>
                                </div>
                                {!stmt.isPaid && (
                                  <button
                                    onClick={() =>
                                      markStatementPaid(card.id, stmt.id)
                                    }
                                    className="btn-secondary px-6 py-2 text-xs hover:bg-primary-500 hover:text-white transition-all shadow-md active:scale-95"
                                  >
                                    Pay Now
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <EmptyState
                          icon={Calendar}
                          title="No recent statements reported"
                          className="py-10"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Billing Config" variant="white">
                <div className="space-y-6">
                  <div className="flex gap-4 p-5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight">
                        Smart Reminders
                      </p>
                      <p className="text-xs text-amber-800/80 dark:text-amber-200/50 mt-1 leading-relaxed">
                        A red alert will appear on your statements 3 days before
                        the due date.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-5 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/20">
                    <CheckCircle className="w-6 h-6 text-primary-600 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-primary-900 dark:text-primary-100 uppercase tracking-tight">
                        Limit Settings
                      </p>
                      <p className="text-xs text-primary-800/80 dark:text-primary-200/50 mt-1 leading-relaxed">
                        Usage is calculated against your current limit to
                        provide utilization insights.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card variant="blue" className="group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex flex-col gap-6 relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white mb-2">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">
                      Keep it low, Keep it smart.
                    </h4>
                    <p className="text-white/60 text-sm mt-2">
                      Maintaining utilization under 30% helps your credit
                      health.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsUsageModalOpen(true)}
                    className="btn bg-white text-primary-500 hover:bg-white/90 font-black text-sm py-4 active:scale-95 transition-all shadow-xl"
                  >
                    Log New Purchase
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Edit Profile Modal - Always rendered to ensure state transitions work */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={card ? "Card Profile Settings" : "Initialize Card Profile"}
      >
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest font-sans">
              Card Name
            </label>
            <input
              type="text"
              value={profileData.cardName}
              onChange={(e) =>
                setProfileData({ ...profileData, cardName: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest font-sans">
              Credit Limit (IDR)
            </label>
            <input
              type="number"
              value={profileData.creditLimit}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  creditLimit: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest font-sans">
                Stat. Date
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={profileData.statementDate}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    statementDate: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest font-sans">
                Due Date
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={profileData.dueDate}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    dueDate: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn btn-primary">
              {card ? "Save Profile" : "Create Card"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Input Usage Modal */}
      <Modal
        isOpen={isUsageModalOpen}
        onClose={() => setIsUsageModalOpen(false)}
        title="Input Credit Card Usage"
      >
        <form onSubmit={handleAddUsage} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest font-sans">
              Merchant Name
            </label>
            <input
              type="text"
              placeholder="e.g. Starbucks, Amazon"
              value={usageData.merchant}
              onChange={(e) =>
                setUsageData({ ...usageData, merchant: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest font-sans">
              Amount (IDR)
            </label>
            <input
              type="number"
              placeholder="0"
              value={usageData.amount}
              onChange={(e) =>
                setUsageData({ ...usageData, amount: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest font-sans">
              Category
            </label>
            <select
              value={usageData.category}
              onChange={(e) =>
                setUsageData({ ...usageData, category: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all"
            >
              <option value="Food">Food & Dining</option>
              <option value="Shopping">Shopping</option>
              <option value="Transport">Transport</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsUsageModalOpen(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn btn-primary">
              Log Usage
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
