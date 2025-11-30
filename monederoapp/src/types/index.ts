export interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  accountNumber: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'deposit' | 'withdraw' | 'request';
  amount: number;
  recipient?: string;
  sender?: string;
  note?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export type ViewType = 'dashboard' | 'send' | 'request' | 'deposit' | 'withdraw' | 'history';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
