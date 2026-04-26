import { create } from "zustand";
import { SimpleTransaction, SimpleTransactionStore, SimpleTransactionFilters } from "../types/simpleTransaction";
import { StorageService } from "../services/storage/storageService";
import { useExpenseStore } from "./useExpenseStore";
import { useAccountsStore } from "./useAccountsStore";
import { useCreditCardStore } from "./useCreditCardStore";
import { useFreelanceStore } from "./useFreelanceStore";
import { Expense, ExpenseCategory } from "../types/expense";

export const useSimpleTransactionStore = create<SimpleTransactionStore>((set, get) => ({
  transactions: StorageService.get<SimpleTransaction[]>("simpleTransactions") || [],

  addTransaction: async (tx: SimpleTransaction) => {
    const updated = [tx, ...get().transactions];
    await StorageService.set("simpleTransactions", updated);
    set({ transactions: updated });

    const accountsStore = useAccountsStore.getState();

    if (tx.type === "expense") {
      // Link to Expense Store
      const expenseStore = useExpenseStore.getState();
      const ccStore = useCreditCardStore.getState();

      // Map SimpleTransaction to Expense
      const expense: Expense = {
        id: tx.id,
        date: tx.date,
        amount: tx.amount,
        category: tx.category as ExpenseCategory,
        accountId: "", // Will be set below
        accountType: tx.fromCC ? "credit_card" : "bank",
        note: `${tx.subCategory}: ${tx.description}`,
        createdAt: tx.createdAt,
      };

      if (tx.fromCC) {
        const card = ccStore.cards.find(c => c.cardName === tx.creditCardName);
        expense.accountId = card ? card.id : (tx.creditCardName || "");
      } else {
        const account = accountsStore.accounts.find(a => a.bank === tx.fromBank || a.name === tx.fromBank);
        expense.accountId = account ? account.id : tx.fromBank;
      }

      await expenseStore.addExpense(expense);

      // If it's a transfer (toBank is set), we need to add balance to the destination
      if (tx.toBank && !tx.fromCC) {
        const destAccount = accountsStore.accounts.find(a => a.bank === tx.toBank || a.name === tx.toBank);
        if (destAccount) {
          await accountsStore.updateAccount(destAccount.id, {
            balance: destAccount.balance + tx.amount,
          });
        }
      }
    } else {
      // Logic for INCOME
      // Add balance to "toBank"
      const destAccount = accountsStore.accounts.find(a => a.bank === tx.toBank || a.name === tx.toBank);
      if (destAccount) {
        await accountsStore.updateAccount(destAccount.id, {
          balance: destAccount.balance + tx.amount,
        });
      }

      // Link to Freelance Store (Income Stream)
      const freelanceStore = useFreelanceStore.getState();
      await freelanceStore.addIncome({
        id: tx.id,
        date: tx.date,
        category: "Other", // Defaulting to "Other" for simple mode
        client: tx.category,
        project: tx.subCategory,
        amount: tx.amount,
        receivedAt: tx.createdAt,
        toAccount: tx.toBank || "",
        allocations: [],
        status: "pending",
      });
    }
  },

  updateTransaction: async (id: string, updates: Partial<SimpleTransaction>) => {
    const tx = get().transactions.find((t) => t.id === id);
    if (!tx) return;

    // Safely revert old balances by deleting
    await get().deleteTransaction(id);

    // Apply new data
    const updatedTx = { ...tx, ...updates };
    
    // Add transaction back (which applies new balances)
    await get().addTransaction(updatedTx);

    // Re-sort transactions by date descending to maintain order
    const sorted = [...get().transactions].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    await StorageService.set("simpleTransactions", sorted);
    set({ transactions: sorted });
  },

  deleteTransaction: async (id: string) => {
    const tx = get().transactions.find((t) => t.id === id);
    if (!tx) return;

    const updated = get().transactions.filter((t) => t.id !== id);
    await StorageService.set("simpleTransactions", updated);
    set({ transactions: updated });

    const accountsStore = useAccountsStore.getState();

    if (tx.type === "expense") {
      // Also delete from Expense Store to revert balances
      useExpenseStore.getState().deleteExpense(id);
      
      // If it was a transfer, revert the destination balance too
      if (tx.toBank && !tx.fromCC) {
        const destAccount = accountsStore.accounts.find(a => a.bank === tx.toBank || a.name === tx.toBank);
        if (destAccount) {
          accountsStore.updateAccount(destAccount.id, {
            balance: destAccount.balance - tx.amount,
          });
        }
      }
    } else {
      // Revert Income
      const destAccount = accountsStore.accounts.find(a => a.bank === tx.toBank || a.name === tx.toBank);
      if (destAccount) {
        accountsStore.updateAccount(destAccount.id, {
          balance: destAccount.balance - tx.amount,
        });
      }

      // Delete from Freelance Store
      useFreelanceStore.getState().deleteIncome(id);
    }
  },

  getTransactionsByMonth: (month: string) => {
    return get().transactions.filter((t) => t.date.startsWith(month));
  },

  getTransactionsByDate: (date: string) => {
    return get().transactions.filter((t) => t.date === date);
  },

  filters: {
    startDate: "",
    endDate: "",
    fromSource: "",
    toSource: "",
    category: "",
    fromCC: null,
  },

  setFilters: (newFilters: Partial<SimpleTransactionFilters>) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },

  resetFilters: () => {
    set({
      filters: {
        startDate: "",
        endDate: "",
        fromSource: "",
        toSource: "",
        category: "",
        fromCC: null,
      },
    });
  },

  applyFilters: (tx: SimpleTransaction) => {
    const filters = get().filters;
    
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

    return dateRangeMatch && fromMatch && toMatch && categoryMatch && ccMatch;
  },
}));
