export interface CreditCardTransaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
}

export interface CreditCardStatement {
  id: string;
  month: string;
  statementDate: string;
  dueDate: string;
  totalSpent: number;
  isPaid: boolean;
  paidAt: string | null;
  transactions: CreditCardTransaction[];
}

export interface CreditCard {
  id: string;
  bank: string;
  cardName: string;
  lastFourDigits: string;
  creditLimit: number;
  billingCycle: {
    statementDate: number;
    dueDate: number;
  };
  statements: CreditCardStatement[];
  currentMonth: {
    spent: number;
    availableCredit: number;
    utilizationRate: number;
    transactions: CreditCardTransaction[];
  };
}

export interface CreditCardStore {
  cards: CreditCard[];
  setCards: (cards: CreditCard[]) => void;
  addCard: (card: CreditCard) => void;
  updateCard: (id: string, updates: Partial<CreditCard>) => void;
  addTransaction: (cardId: string, transaction: CreditCardTransaction) => void;
  markStatementPaid: (cardId: string, statementId: string) => void;
}
