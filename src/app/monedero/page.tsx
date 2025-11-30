'use client';

import { useState } from 'react';
import './monedero.css';
import Dashboard from './components/Dashboard';
import SendMoney from './components/SendMoney';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import History from './components/History';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

type ViewType = 'dashboard' | 'send' | 'request' | 'deposit' | 'withdraw' | 'history';

import { User, Transaction } from './types';


const mockTransactions: Transaction[] = [
    { id: '1', type: 'receive', amount: 1500, sender: 'John Doe', note: 'Payment received', date: new Date(Date.now() - 3600000).toISOString(), status: 'completed' },
    { id: '2', type: 'send', amount: 500, recipient: 'Jane Smith', note: 'Payment sent', date: new Date(Date.now() - 7200000).toISOString(), status: 'completed' },
    { id: '3', type: 'deposit', amount: 2000, note: 'Bank deposit', date: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
];

export default function MonederoPage() {
    const { data: session, status } = useSession();
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');
    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [user, setUser] = useState<User>({
        id: session?.user?.id || '1',
        email: session?.user?.email || 'user@example.com',
        name: session?.user?.name || 'Usuario',
        balance: 5420.50,
        accountNumber: '****1234'
    });

    if (status === 'loading') {
        return <div className="loading">Cargando...</div>;
    }

    if (status === 'unauthenticated') {
        redirect('/login');
    }

    const handleNavigate = (view: ViewType) => {
        setCurrentView(view);
    };

    const handleSend = (recipient: string, amount: number, note: string) => {
        const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: 'send',
            amount,
            recipient,
            note,
            date: new Date().toISOString(),
            status: 'completed'
        };
        setTransactions([newTransaction, ...transactions]);
        setUser({ ...user, balance: user.balance - amount });
    };

    const handleDeposit = (amount: number, method: string) => {
        const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: 'deposit',
            amount,
            note: `${method} deposit`,
            date: new Date().toISOString(),
            status: 'completed'
        };
        setTransactions([newTransaction, ...transactions]);
        setUser({ ...user, balance: user.balance + amount });
    };

    const handleWithdraw = (amount: number, destination: string) => {
        const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: 'withdraw',
            amount,
            note: `Withdrawal to ${destination}`,
            date: new Date().toISOString(),
            status: 'completed'
        };
        setTransactions([newTransaction, ...transactions]);
        setUser({ ...user, balance: user.balance - amount });
    };

    return (
        <div className="monedero-app">
            <nav className="sidebar glass">
                <div className="sidebar-header">
                    <h1 className="logo gradient-text">Monedera</h1>
                    <p className="tagline">Digital Wallet</p>
                </div>

                <div className="nav-menu">
                    <button
                        className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleNavigate('dashboard')}
                    >
                        <span className="nav-icon">📊</span>
                        <span className="nav-label">Dashboard</span>
                    </button>
                    <button
                        className={`nav-item ${currentView === 'send' ? 'active' : ''}`}
                        onClick={() => handleNavigate('send')}
                    >
                        <span className="nav-icon">↗</span>
                        <span className="nav-label">Enviar Dinero</span>
                    </button>
                    <button
                        className={`nav-item ${currentView === 'deposit' ? 'active' : ''}`}
                        onClick={() => handleNavigate('deposit')}
                    >
                        <span className="nav-icon">⬇</span>
                        <span className="nav-label">Depositar</span>
                    </button>
                    <button
                        className={`nav-item ${currentView === 'withdraw' ? 'active' : ''}`}
                        onClick={() => handleNavigate('withdraw')}
                    >
                        <span className="nav-icon">⬆</span>
                        <span className="nav-label">Retirar</span>
                    </button>
                    <button
                        className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
                        onClick={() => handleNavigate('history')}
                    >
                        <span className="nav-icon">📜</span>
                        <span className="nav-label">Historial</span>
                    </button>
                </div>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar gradient-primary">
                            {user.name.charAt(0)}
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                        </div>
                    </div>
                    <a href="/dashboard" className="btn btn-secondary btn-block">
                        Volver a B2BChat
                    </a>
                </div>
            </nav>

            <main className="main-content">
                {currentView === 'dashboard' && (
                    <Dashboard user={user} transactions={transactions} onNavigate={handleNavigate} />
                )}
                {currentView === 'send' && (
                    <SendMoney user={user} onSend={handleSend} onBack={() => handleNavigate('dashboard')} />
                )}
                {currentView === 'deposit' && (
                    <Deposit user={user} onDeposit={handleDeposit} onBack={() => handleNavigate('dashboard')} />
                )}
                {currentView === 'withdraw' && (
                    <Withdraw user={user} onWithdraw={handleWithdraw} onBack={() => handleNavigate('dashboard')} />
                )}
                {currentView === 'history' && (
                    <History transactions={transactions} onBack={() => handleNavigate('dashboard')} />
                )}
            </main>
        </div>
    );
}
