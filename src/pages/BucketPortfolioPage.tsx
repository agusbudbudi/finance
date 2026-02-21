import { useState, useMemo } from "react";
import { useAccountsStore } from "../stores/useAccountsStore";
import { useProfileStore } from "../stores/useProfileStore";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import { EmptyState } from "../components/common/EmptyState";
import { SelectInput } from "../components/common/SelectInput";
import { CurrencyInput } from "../components/common/CurrencyInput";
import { RowActions } from "../components/common/RowActions";
import { formatCurrency } from "../utils/formatters";
import {
  Plus,
  Wallet,
  Smartphone,
  Banknote,
  PieChart,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Search,
  AlertCircle,
  Zap,
} from "lucide-react";
import { Account, AccountType, AccountPurpose } from "../types/account";

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: any }[] = [
  { value: "savings", label: "Savings Account", icon: Banknote },
  { value: "checking", label: "Checking Account", icon: Wallet },
  { value: "ewallet", label: "E-Wallet", icon: Smartphone },
  { value: "investment", label: "Investment Account", icon: TrendingUp },
  { value: "deposit", label: "Time Deposit", icon: ShieldCheck },
];

const PURPOSES: { value: AccountPurpose; label: string }[] = [
  { value: "salary_savings", label: "Salary & Savings" },
  { value: "daily_spending", label: "Daily Spending" },
  { value: "family_allocation", label: "Family Allocation" },
  { value: "freelance", label: "Freelance Income" },
  { value: "emergency_fund", label: "Emergency Fund" },
  { value: "investment", label: "Investment Capital" },
];

export const BucketPortfolioPage = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } =
    useAccountsStore();
  const { profile } = useProfileStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    type: "savings" as AccountType,
    purpose: "salary_savings" as AccountPurpose,
    balance: "",
    isSalaryAccount: false,
  });

  const totalBalance = useMemo(() => {
    return accounts.reduce(
      (sum, acc) => sum + (acc.isActive ? acc.balance : 0),
      0,
    );
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(
      (acc) =>
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.bank.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [accounts, searchQuery]);

  const purposeBreakdown = useMemo(() => {
    const breakdown: Record<AccountPurpose, number> = {} as any;
    accounts.forEach((acc) => {
      if (acc.isActive) {
        breakdown[acc.purpose] = (breakdown[acc.purpose] || 0) + acc.balance;
      }
    });
    return Object.entries(breakdown)
      .map(([purpose, balance]) => ({
        purpose: purpose as AccountPurpose,
        balance,
        percentage: totalBalance > 0 ? (balance / totalBalance) * 100 : 0,
        label: PURPOSES.find((p) => p.value === purpose)?.label || purpose,
      }))
      .sort((a, b) => b.balance - a.balance);
  }, [accounts, totalBalance]);

  const runwayMonths = useMemo(() => {
    if (!profile || profile.monthlySalary === 0) return 0;
    return totalBalance / profile.monthlySalary;
  }, [totalBalance, profile]);

  const bucketStats = useMemo(() => {
    const activeAccounts = accounts.filter(acc => acc.isActive);
    const avgBalance = activeAccounts.length > 0 ? totalBalance / activeAccounts.length : 0;
    
    const primaryAccount = activeAccounts.find(acc => acc.isSalaryAccount);
    
    return {
      count: activeAccounts.length,
      avgBalance,
      primaryAccount
    };
  }, [accounts, totalBalance]);

  const handleEdit = (account: Account) => {
    setEditingAccountId(account.id);
    setFormData({
      name: account.name,
      bank: account.bank,
      type: account.type,
      purpose: account.purpose,
      balance: account.balance.toString(),
      isSalaryAccount: !!account.isSalaryAccount,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseInt(formData.balance);
    if (isNaN(balanceNum)) return;

    if (editingAccountId) {
      updateAccount(editingAccountId, {
        name: formData.name,
        bank: formData.bank,
        type: formData.type,
        purpose: formData.purpose,
        balance: balanceNum,
        isSalaryAccount: formData.isSalaryAccount,
      });
    } else {
      const newAccount: Account = {
        id: `acc_${Date.now()}`,
        name: formData.name,
        bank: formData.bank,
        type: formData.type,
        purpose: formData.purpose,
        balance: balanceNum,
        isActive: true,
        isSalaryAccount: formData.isSalaryAccount,
      };
      addAccount(newAccount);
    }

    setIsModalOpen(false);
    setEditingAccountId(null);
    setFormData({
      name: "",
      bank: "",
      type: "savings",
      purpose: "salary_savings",
      balance: "",
      isSalaryAccount: false,
    });
  };

  const hasSalaryAccount = useMemo(() => {
    return accounts.some((acc) => acc.isSalaryAccount);
  }, [accounts]);

  const getAccountIcon = (type: AccountType) => {
    const found = ACCOUNT_TYPES.find((t) => t.value === type);
    const Icon = found?.icon || Wallet;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-28 md:pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Liquid Assets
          </h2>
          <p className="text-gray-500 dark:text-white/70 font-medium">
            Manage your bank accounts and digital wallets in one place.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-md px-4 py-3.5 md:py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/50 flex items-center gap-3 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all w-full md:w-72 group shadow-sm">
            <Search className="w-4 h-4 text-gray-400 dark:text-white/50 group-focus-within:text-primary-500 dark:group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Filter buckets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm w-full placeholder:text-gray-400 dark:placeholder:text-white/40 font-medium"
            />
          </div>
          <button
            onClick={() => {
              setEditingAccountId(null);
              setFormData({
                name: "",
                bank: "",
                type: "savings",
                purpose: "salary_savings",
                balance: "",
                isSalaryAccount: false,
              });
              setIsModalOpen(true);
            }}
            className="hidden md:flex btn bg-primary-500 dark:bg-white text-white dark:text-primary-500 hover:opacity-90 shadow-2xl shadow-primary-500/30 ring-4 ring-primary-500/10 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add New Account
          </button>
        </div>
      </div>

      {!hasSalaryAccount && accounts.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/20 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/10 rounded-xl flex items-center justify-center text-amber-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight">
              Action Required: Missing Salary Account
            </p>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/50 mt-0.5 font-medium">
              Please designatate one of your accounts as the **Primary Salary
              Account**. This is crucial for budget strategy automation.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sticky Summary */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <Card
            variant="blue"
            className="border-none relative overflow-hidden group shadow-2xl shadow-primary-500/20"
          >
            <div className="absolute -right-4 -bottom-4 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-primary-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 space-y-6 text-white">
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                  Total Assets Value
                </p>
                <div className="flex items-baseline gap-1 overflow-hidden">
                  <h3
                    className={`font-black tracking-tight drop-shadow-sm transition-all duration-300 ${
                      formatCurrency(totalBalance).length > 16
                        ? "text-xl md:text-2xl"
                        : formatCurrency(totalBalance).length > 12
                          ? "text-2xl md:text-3xl"
                          : "text-3xl md:text-4xl"
                    }`}
                  >
                    {formatCurrency(totalBalance)}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                  <p className="text-white/50 text-[8px] font-black uppercase tracking-wider mb-1">Buckets</p>
                  <p className="text-lg font-black">{bucketStats.count}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                  <p className="text-white/50 text-[8px] font-black uppercase tracking-wider mb-1">Avg / Bucket</p>
                  <p className="text-lg font-black">{formatCurrency(bucketStats.avgBalance)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-white/50 text-[8px] font-black uppercase tracking-wider">Runway Estimate</p>
                    <p className="text-xl font-black">{runwayMonths.toFixed(1)} <span className="text-[10px] opacity-40">Months</span></p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-white/30" />
                </div>
                
                <div className="flex items-center gap-2 pt-1">
                  {bucketStats.primaryAccount ? (
                    <div className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-bold text-white/70">
                      Primary: {bucketStats.primaryAccount.bank}
                    </div>
                  ) : (
                    <div className="px-2 py-0.5 bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded text-[9px] font-bold">
                      No Salary Account Set
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {accounts.length > 0 && (
            <Card
              title="Purpose Allocation"
              subtitle="Asset distribution by use case"
              bodyClassName="px-5 py-5"
            >
              <div className="space-y-4">
                {purposeBreakdown.map((item) => (
                  <div key={item.purpose} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-gray-900 dark:text-white uppercase tracking-tight truncate max-w-[70%]">
                        {item.label}
                      </span>
                      <span className="text-primary-500">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="bg-gray-100/50 dark:bg-white/5 rounded-xl p-6 border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm shrink-0">
                <ShieldCheck className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h4 className="font-black text-sm text-gray-900 dark:text-white leading-tight">
                  Vault Protected
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  Your data remains on your device.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Deck */}
        <div className="lg:col-span-8 space-y-6">
          {filteredAccounts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {filteredAccounts.map((account) => (
                <Card
                  key={account.id}
                  bodyClassName="p-4 md:p-6"
                  className="group relative hover:border-primary-400/50 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-105 ${
                          account.type === "ewallet"
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50"
                            : "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800/50"
                        }`}
                      >
                        {getAccountIcon(account.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                            {account.name}
                          </h3>
                          {account.isSalaryAccount && (
                            <span className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[9px] font-black uppercase tracking-wider border border-primary-100 dark:border-primary-900/20 shadow-sm flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" />
                              Primary Salary
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 font-bold text-[10px] text-gray-400 uppercase tracking-widest">
                          <span>{account.bank}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-gray-400/80">
                            {PURPOSES.find((p) => p.value === account.purpose)
                              ?.label || account.purpose}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 border-t sm:border-t-0 border-gray-50 dark:border-gray-800 pt-3 sm:pt-0">
                      <p className="text-xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
                        {formatCurrency(account.balance)}
                      </p>
                      
                      <RowActions
                        onEdit={() => handleEdit(account)}
                        onDelete={() => deleteAccount(account.id)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Wallet}
              title={searchQuery ? "No matches found" : "No buckets created"}
              description={
                searchQuery
                  ? `We couldn't find any accounts matching "${searchQuery}". Try a different search term.`
                  : "Start adding your bank accounts and e-wallets to build your financial ecosystem."
              }
              action={
                <button
                  onClick={() => {
                    setSearchQuery("");
                    if (!searchQuery) setIsModalOpen(true);
                  }}
                  className="btn btn-secondary px-8 font-black uppercase tracking-widest text-xs rounded-xl transition-all"
                >
                  {searchQuery ? "Clear Search" : "Create First Bucket"}
                </button>
              }
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccountId ? "Edit Account" : "Add New Account"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
                Account Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
                placeholder="e.g. Main Savings"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
                Bank / Provider
              </label>
              <input
                type="text"
                required
                value={formData.bank}
                onChange={(e) =>
                  setFormData({ ...formData, bank: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
                placeholder="e.g. Mandiri, OVO"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
                Type
              </label>
              <SelectInput
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as AccountType,
                  })
                }
                className="px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </SelectInput>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
                Purpose
              </label>
              <SelectInput
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    purpose: e.target.value as AccountPurpose,
                  })
                }
                className="px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all"
              >
                {PURPOSES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest ml-1">
              Current Balance
            </label>
            <CurrencyInput
              required
              value={formData.balance}
              onChange={(val) =>
                setFormData({ ...formData, balance: val })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white font-bold focus:border-primary-500 outline-none transition-all font-sans"
              placeholder="Rp 0"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/20 group cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-all">
            <label className="flex items-center gap-3 w-full cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={formData.isSalaryAccount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isSalaryAccount: e.target.checked,
                    })
                  }
                  className="peer appearance-none w-6 h-6 rounded-xl border-2 border-primary-200 dark:border-primary-800 checked:bg-primary-500 checked:border-primary-500 transition-all outline-none"
                />
                <CheckCircle2 className="w-4 h-4 text-white absolute scale-0 peer-checked:scale-100 transition-transform duration-200" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-primary-900 dark:text-primary-100 uppercase tracking-tight leading-none">
                  Set as Salary Account
                </span>
                <span className="text-[10px] text-primary-700/60 dark:text-primary-400 mt-1 font-bold leading-tight">
                  Designate as the primary source for monthly budget
                  distribution.
                </span>
              </div>
            </label>
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
              {editingAccountId ? "Update Account" : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* Sticky Mobile Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 z-40">
        <button
          onClick={() => {
            setEditingAccountId(null);
            setFormData({
              name: "",
              bank: "",
              type: "savings",
              purpose: "salary_savings",
              balance: "",
              isSalaryAccount: false,
            });
            setIsModalOpen(true);
          }}
          className="btn w-full bg-primary-500 dark:bg-white text-white dark:text-primary-500 shadow-xl shadow-primary-500/20 py-4 font-black"
        >
          <Plus className="w-5 h-5" />
          Add New Account
        </button>
      </div>
    </div>
  );
};
