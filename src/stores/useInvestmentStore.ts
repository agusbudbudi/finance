import { create } from "zustand";
import {
  Investment,
  InvestmentStore,
  InvestmentContribution,
} from "../types/investment";
import { StorageService } from "../services/storage/storageService";
import { InvestmentCalculator } from "../services/calculations/investmentCalculator";

const DEFAULT_INVESTMENT: Investment = {
  startMonth: "2026-02",
  monthlyContribution: 0,
  estimatedAnnualReturn: 0,
  contributions: [],
  summary: {
    totalContributed: 0,
    estimatedValue: 0,
    estimatedReturn: 0,
    returnRate: 0,
  },
  projections: [],
};

export const useInvestmentStore = create<InvestmentStore>((set, get) => {
  // Initialize with stored data or defaults
  const stored = StorageService.get<Investment>("investments");

  return {
    investment: stored || { ...DEFAULT_INVESTMENT },

    setInvestment: (investment: Investment) => {
      StorageService.set("investments", investment);
      set({ investment });
    },

    updateConfig: (monthlyContribution: number, annualReturn: number) => {
      const current = get().investment;
      if (!current) return;

      const updated = {
        ...current,
        monthlyContribution,
        estimatedAnnualReturn: annualReturn,
      };

      // Recalculate projections immediately
      updated.projections = InvestmentCalculator.calculateProjections(
        updated.startMonth,
        updated.monthlyContribution,
        updated.estimatedAnnualReturn,
      );

      StorageService.set("investments", updated);
      set({ investment: updated });
    },

    addContribution: (contribution: InvestmentContribution) => {
      const current = get().investment;
      if (!current) return;

      const updatedContributions = [...current.contributions, contribution];
      const totalContributed =
        InvestmentCalculator.getTotalContributed(updatedContributions);
      const estimatedValue = InvestmentCalculator.getEstimatedValue(
        updatedContributions,
        current.estimatedAnnualReturn,
      );

      const updated: Investment = {
        ...current,
        contributions: updatedContributions,
        summary: {
          totalContributed,
          estimatedValue,
          estimatedReturn: InvestmentCalculator.getEstimatedReturn(
            totalContributed,
            estimatedValue,
          ),
          returnRate: InvestmentCalculator.getReturnRate(
            totalContributed,
            estimatedValue,
          ),
        },
      };

      StorageService.set("investments", updated);
      set({ investment: updated });
    },

    updateProjections: () => {
      const current = get().investment;
      if (!current) return;

      const projections = InvestmentCalculator.calculateProjections(
        current.startMonth,
        current.monthlyContribution,
        current.estimatedAnnualReturn,
      );

      const updated = { ...current, projections };
      StorageService.set("investments", updated);
      set({ investment: updated });
    },
  };
});
