import { Transaction, Insight } from './types';
import { subDays, format } from 'date-fns';

const generateTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const merchants = ['Uber', 'Whole Foods', 'Netflix', 'Amazon', 'Starbucks', 'Shell', 'Spotify', 'Apple', 'Trader Joes', 'Target'];
  
  for (let i = 0; i < 50; i++) {
    const isExpense = Math.random() > 0.2;
    const amount = isExpense 
      ? parseFloat((Math.random() * 200).toFixed(2)) 
      : parseFloat((Math.random() * 3000 + 1000).toFixed(2));
    
    transactions.push({
      id: `txn-${i}`,
      date: format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
      amount: amount,
      category: isExpense ? ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping'][Math.floor(Math.random() * 4)] : 'Income',
      merchant: isExpense ? merchants[Math.floor(Math.random() * merchants.length)] : 'Salary',
      type: isExpense ? 'expense' : 'income',
      isRecurring: Math.random() > 0.8
    });
  }
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_TRANSACTIONS = generateTransactions();

export const MOCK_INSIGHTS: Insight[] = [
  {
    id: '1',
    title: 'Unusual Spending Detected',
    description: 'Your spending on "Food & Dining" is 35% higher than last month. Consider cooking at home this weekend.',
    type: 'warning',
    date: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Recurring Subscription Found',
    description: 'We noticed a recurring charge from "Netflix". Would you like to track this as a fixed expense?',
    type: 'tip',
    date: subDays(new Date(), 2).toISOString()
  },
  {
    id: '3',
    title: 'Savings Goal On Track',
    description: 'Great job! You are under budget for "Entertainment" this week.',
    type: 'positive',
    date: subDays(new Date(), 5).toISOString()
  }
];
