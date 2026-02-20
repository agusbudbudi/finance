export interface InvestmentContribution {
  id: string;
  month: string;
  amount: number;
  contributedAt: string;
  type: string;
  product: string;
}

export interface InvestmentProjection {
  month: string;
  contribution: number;
  cumulativeContribution: number;
  estimatedValue: number;
}

export interface Investment {
  startMonth: string;
  monthlyContribution: number;
  estimatedAnnualReturn: number;
  contributions: InvestmentContribution[];
  summary: {
    totalContributed: number;
    estimatedValue: number;
    estimatedReturn: number;
    returnRate: number;
  };
  projections: InvestmentProjection[];
}

export interface InvestmentStore {
  investment: Investment | null;
  setInvestment: (investment: Investment) => void;
  updateConfig: (monthlyContribution: number, annualReturn: number) => void;
  addContribution: (contribution: InvestmentContribution) => void;
  updateProjections: () => void;
}
