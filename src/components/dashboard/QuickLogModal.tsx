import { useState } from "react";
import { Plus, ShoppingCart, Briefcase, X, Wallet, CreditCard } from "lucide-react";
import { Modal } from "../common/Modal";
import { CurrencyInput } from "../common/CurrencyInput";
import { SelectInput } from "../common/SelectInput";
import { useExpenseStore } from "../../stores/useExpenseStore";
import { useFreelanceStore } from "../../stores/useFreelanceStore";
import { useAccountsStore } from "../../stores/useAccountsStore";
import { useCreditCardStore } from "../../stores/useCreditCardStore";
import { Expense } from "../../types/expense";
import { FreelanceIncome } from "../../types/freelance";
import { formatCurrency } from "../../utils/formatters";
import { CATEGORY_LABELS } from "../../utils/constants";


interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LogType = "expense" | "income";

const EXPENSE_CATEGORIES = [
  "Food & Drink",
  "Transportation",
  "Shopping",
  "Utilities",
  "Entertainment",
  "Health",
  "Investment",
  "Other",
];

const INCOME_CATEGORIES = ["Freelance", "Bonus", "THR", "Other"];






export const QuickLogModal = ({ isOpen, onClose }: QuickLogModalProps) => {
  const [logType, setLogType] = useState<LogType>("expense");
  const { addExpense } = useExpenseStore();
  const { addIncome } = useFreelanceStore();
  const { accounts } = useAccountsStore();
  const { cards } = useCreditCardStore();

  // Manual form states to match FreelancePage implementation
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    category: "Food & Drink",
    accountId: "",
    note: "",
  });

  const [incomeForm, setIncomeForm] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    category: "Freelance",
    client: "",
    project: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateExpense = () => {
    const newErrors: Record<string, string> = {};
    if (!expenseForm.amount || parseInt(expenseForm.amount.replace(/\D/g, "")) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }
    if (!expenseForm.accountId) {
      newErrors.accountId = "Account/Card is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateIncome = () => {
    const newErrors: Record<string, string> = {};
    if (!incomeForm.amount || parseInt(incomeForm.amount.replace(/\D/g, "")) <= 0) {
      newErrors.amount = "Amount is required";
    }
    if (!incomeForm.client) {
      newErrors.client = "Source Name is required";
    }
    if (!incomeForm.project) {
      newErrors.project = "Note / Project is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateExpense()) return;

    const amountNum = parseInt(expenseForm.amount.replace(/\D/g, "") || "0");
    const isBank = accounts.some((a) => a.id === expenseForm.accountId);

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      date: expenseForm.date,
      amount: amountNum,
      category: expenseForm.category as any,
      accountId: expenseForm.accountId,
      accountType: isBank ? "bank" : "credit_card",
      note: expenseForm.note || "",
      type: "manual",
      createdAt: new Date().toISOString(),
    };

    addExpense(newExpense);
    onClose();
    setExpenseForm({
      date: new Date().toISOString().split("T")[0],
      amount: "",
      category: "Food & Drink",
      accountId: "",
      note: "",
    });
    setErrors({});
  };

  const onAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateIncome()) return;

    const amountNum = parseInt(incomeForm.amount.replace(/\D/g, "") || "0");
    const newIncome: FreelanceIncome = {
      id: crypto.randomUUID(),
      date: incomeForm.date,
      category: incomeForm.category as any,
      client: incomeForm.client,
      project: incomeForm.project,
      amount: amountNum,
      receivedAt: new Date().toISOString(),
      toAccount: "acc_004", // Default to BRI Freelance account
      allocations: [],
      status: "pending",
    };

    addIncome(newIncome);
    onClose();
    setIncomeForm({
      date: new Date().toISOString().split("T")[0],
      amount: "",
      category: "Freelance",
      client: "",
      project: "",
    });
    setErrors({});
  };




  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Log">
      <div className="space-y-6">
        {/* Log Type Switcher */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
          <button
            onClick={() => {
              setLogType("expense");
              setErrors({});
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-black transition-all ${
              logType === "expense"
                ? "bg-white dark:bg-gray-800 text-red-500 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Expense
          </button>
          <button
            onClick={() => {
              setLogType("income");
              setErrors({});
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-black transition-all ${
              logType === "income"
                ? "bg-white dark:bg-gray-800 text-emerald-500 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Income
          </button>
        </div>

        {logType === "expense" ? (
          <form onSubmit={onAddExpense} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-white/40 uppercase mb-2 tracking-widest ml-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold border-gray-100 dark:border-gray-800 focus:border-primary-500 outline-none transition-all"
                />

              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-white/40 uppercase mb-2 tracking-widest ml-1">
                  Amount
                </label>
                <CurrencyInput
                  value={expenseForm.amount}
                  onChange={(val) => setExpenseForm({ ...expenseForm, amount: val })}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold font-sans focus:border-primary-500 outline-none transition-all ${
                    errors.amount ? "border-red-500" : "border-gray-100 dark:border-gray-800"
                  }`}
                  placeholder="Rp 0"
                />
                {errors.amount && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.amount}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
                Category
              </label>
              <SelectInput
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold border-gray-100 dark:border-gray-800 focus:border-primary-500 outline-none transition-all"
              >

                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
                Paid From
              </label>
              <SelectInput
                value={expenseForm.accountId}
                onChange={(e) => setExpenseForm({ ...expenseForm, accountId: e.target.value })}
                className={`px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all ${
                  errors.accountId ? "border-red-500" : "border-gray-100 dark:border-gray-800"
                }`}
              >

                <option value="">Select account</option>
                <optgroup label="Bank Accounts">
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bank}: {acc.name}
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
              </SelectInput>
              {errors.accountId && (
                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.accountId}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
                Note / Merchant
              </label>
              <input
                type="text"
                value={expenseForm.note}
                onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
                placeholder="e.g. Starbucks, Go-jek"
              />

            </div>

            <button type="submit" className="w-full btn btn-primary py-4 mt-2">
              Save Expense
            </button>
          </form>
        ) : (
          <form onSubmit={onAddIncome} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-white/40 uppercase mb-2 tracking-widest ml-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
                />

              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-white/40 uppercase mb-2 tracking-widest ml-1">
                  Amount
                </label>
                <CurrencyInput
                  required
                  value={incomeForm.amount}
                  onChange={(val) => setIncomeForm({ ...incomeForm, amount: val })}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold font-sans focus:border-primary-500 outline-none transition-all ${
                    errors.amount ? "border-red-500" : "border-gray-100 dark:border-gray-800"
                  }`}
                  placeholder="Rp 0"
                />


                {errors.amount && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                    {errors.amount}
                  </p>
                )}
              </div>

            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
                Category
              </label>
              <SelectInput
                value={incomeForm.category}
                onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                className="px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold border-gray-100 dark:border-gray-800 focus:border-primary-500 outline-none transition-all"
              >

                {INCOME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
                Source Name
              </label>
              <input
                type="text"
                required
                value={incomeForm.client}
                onChange={(e) => setIncomeForm({ ...incomeForm, client: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all ${
                  errors.client ? "border-red-500" : "border-gray-100 dark:border-gray-800"
                }`}
                placeholder="e.g. Acme Corp or Company THR"
              />

              {errors.client && (
                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                  {errors.client}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
                Note / Project
              </label>
              <input
                type="text"
                required
                value={incomeForm.project}
                onChange={(e) => setIncomeForm({ ...incomeForm, project: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all ${
                  errors.project ? "border-red-500" : "border-gray-100 dark:border-gray-800"
                }`}
                placeholder="e.g. Website Redesign or Year End Bonus"
              />

              {errors.project && (
                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">
                  {errors.project}
                </p>
              )}
            </div>


            <button type="submit" className="w-full btn bg-emerald-500 hover:bg-emerald-600 text-white border-none py-4 mt-2">
              Save Income
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};
