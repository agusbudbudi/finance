import { create } from "zustand";
import {
  CreditCard,
  CreditCardStore,
  CreditCardTransaction,
} from "../types/creditCard";
import { StorageService } from "../services/storage/storageService";
import { CreditCardCalculator } from "../services/calculations/creditCardCalculator";

export const useCreditCardStore = create<CreditCardStore>((set, get) => ({
  cards: StorageService.get<CreditCard[]>("creditCards") || [],

  setCards: (cards: CreditCard[]) => {
    StorageService.set("creditCards", cards);
    set({ cards });
  },

  addCard: (card: CreditCard) => {
    const updated = [...get().cards, card];
    StorageService.set("creditCards", updated);
    set({ cards: updated });
  },

  updateCard: (id: string, updates: Partial<CreditCard>) => {
    const updated = get().cards.map((card) => {
      if (card.id === id) {
        const merged = { ...card, ...updates };

        // If limit changed, recalculate standard metrics
        if (updates.creditLimit !== undefined) {
          merged.currentMonth = {
            ...merged.currentMonth,
            availableCredit: CreditCardCalculator.getAvailableCredit(
              merged.creditLimit,
              merged.currentMonth.spent,
            ),
            utilizationRate: CreditCardCalculator.getUtilizationRate(
              merged.currentMonth.spent,
              merged.creditLimit,
            ),
          };
        }
        return merged;
      }
      return card;
    });
    StorageService.set("creditCards", updated);
    set({ cards: updated });
  },

  addTransaction: (cardId: string, transaction: CreditCardTransaction) => {
    const updated = get().cards.map((card) => {
      if (card.id === cardId) {
        // Simple logic: add to current cycle transactions if there were any,
        // or just assume it's part of the current month's spending
        const newSpent = card.currentMonth.spent + transaction.amount;
        const newTransactions = [
          transaction,
          ...(card.currentMonth.transactions || []),
        ];
        return {
          ...card,
          currentMonth: {
            ...card.currentMonth,
            spent: newSpent,
            transactions: newTransactions,
            availableCredit: CreditCardCalculator.getAvailableCredit(
              card.creditLimit,
              newSpent,
            ),
            utilizationRate: CreditCardCalculator.getUtilizationRate(
              newSpent,
              card.creditLimit,
            ),
          },
        };
      }
      return card;
    });

    StorageService.set("creditCards", updated);
    set({ cards: updated });
  },

  markStatementPaid: (cardId: string, statementId: string) => {
    const updated = get().cards.map((card) => {
      if (card.id === cardId) {
        const updatedStatements = card.statements.map((stmt) =>
          stmt.id === statementId
            ? { ...stmt, isPaid: true, paidAt: new Date().toISOString() }
            : stmt,
        );
        return { ...card, statements: updatedStatements };
      }
      return card;
    });

    StorageService.set("creditCards", updated);
    set({ cards: updated });
  },
}));
