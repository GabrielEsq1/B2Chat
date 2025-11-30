import { Transaction, User } from '../types';

export const mockUser: User = {
  id: '1',
  email: 'demo@monedera.com',
  name: 'Demo User',
  balance: 5420.50,
  accountNumber: 'MND-2024-001'
};

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'receive',
    amount: 1200.00,
    sender: 'John Smith',
    note: 'Payment for services',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: '2',
    type: 'send',
    amount: 350.00,
    recipient: 'Sarah Johnson',
    note: 'Dinner split',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: '3',
    type: 'deposit',
    amount: 2000.00,
    note: 'Bank transfer',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: '4',
    type: 'withdraw',
    amount: 500.00,
    note: 'ATM withdrawal',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: '5',
    type: 'send',
    amount: 125.50,
    recipient: 'Mike Davis',
    note: 'Movie tickets',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: '6',
    type: 'receive',
    amount: 800.00,
    sender: 'Emma Wilson',
    note: 'Freelance work',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: '7',
    type: 'deposit',
    amount: 1500.00,
    note: 'Salary deposit',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: '8',
    type: 'send',
    amount: 75.00,
    recipient: 'Coffee Shop',
    note: 'Monthly subscription',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  }
];

export const testCredentials = {
  email: 'demo@monedera.com',
  password: 'demo123'
};
