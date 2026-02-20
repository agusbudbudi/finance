import { useAccountsStore } from "../../stores/useAccountsStore";
import { useBudgetStore } from "../../stores/useBudgetStore";
import { useCreditCardStore } from "../../stores/useCreditCardStore";
import { useExpenseStore } from "../../stores/useExpenseStore";
import { useFreelanceStore } from "../../stores/useFreelanceStore";
import { useInvestmentStore } from "../../stores/useInvestmentStore";
import { useProfileStore } from "../../stores/useProfileStore";
import { useRecurringStore } from "../../stores/useRecurringStore";
import { StorageService } from "./storageService";

/**
 * Manually update all Zustand stores with fresh data from StorageService.
 * This is called after the vault is unlocked and data is decrypted into memory.
 */
export const rehydrateStores = () => {
  // Profile
  const profile = StorageService.get<any>("profile");
  if (profile) useProfileStore.setState({ profile });

  // Accounts
  const accounts = StorageService.get<any[]>("accounts");
  if (accounts) useAccountsStore.setState({ accounts });

  // Budgets
  const budgets = StorageService.get<any[]>("monthlyBudgets");
  if (budgets) useBudgetStore.setState({ budgets });

  // Credit Cards
  const creditCards = StorageService.get<any[]>("creditCards");
  if (creditCards) useCreditCardStore.setState({ cards: creditCards });

  // Expenses
  const expenses = StorageService.get<any[]>("expenses");
  if (expenses) useExpenseStore.setState({ expenses });

  // Freelance
  const freelance = StorageService.get<any[]>("freelanceIncome");
  if (freelance) useFreelanceStore.setState({ incomes: freelance });

  // Investments
  const investments = StorageService.get<any>("investments");
  if (investments) useInvestmentStore.setState({ investment: investments });

  // Recurring
  const recurring = StorageService.get<any[]>("recurring_tx");
  if (recurring) useRecurringStore.setState({ subscriptions: recurring });
};
