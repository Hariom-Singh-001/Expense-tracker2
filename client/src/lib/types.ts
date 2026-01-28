export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  merchant: string;
  description?: string;
  type: 'expense' | 'income';
  isRecurring?: boolean;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'tip' | 'positive';
  date: string;
}

export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Health',
  'Travel',
  'Income',
  'Other'
];
