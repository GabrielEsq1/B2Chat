import { useState } from 'react';
import { Transaction } from '../types';

interface HistoryProps {
    transactions: Transaction[];
    onBack: () => void;
}

export default function History({ transactions, onBack }: HistoryProps) {
    const [filter, setFilter] = useState<'all' | 'send' | 'receive' | 'deposit' | 'withdraw'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'send': return '↗';
            case 'receive': return '↙';
            case 'deposit': return '⬇';
            case 'withdraw': return '⬆';
            default: return '•';
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'send': return 'transaction-send';
            case 'receive': return 'transaction-receive';
            case 'deposit': return 'transaction-deposit';
            case 'withdraw': return 'transaction-withdraw';
            default: return '';
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        const matchesFilter = filter === 'all' || transaction.type === filter;
        const matchesSearch = searchTerm === '' ||
            transaction.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.sender?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const totalSent = transactions
        .filter(t => t.type === 'send')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalReceived = transactions
        .filter(t => t.type === 'receive')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalDeposits = transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = transactions
        .filter(t => t.type === 'withdraw')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="history-view fade-in">
            <div className="view-header">
                <button className="back-button" onClick={onBack}>
                    ← Back
                </button>
                <h2>Transaction History</h2>
            </div>

            <div className="history-stats">
                <div className="stat-card glass">
                    <div className="stat-label">Total Sent</div>
                    <div className="stat-value negative">{formatCurrency(totalSent)}</div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-label">Total Received</div>
                    <div className="stat-value positive">{formatCurrency(totalReceived)}</div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-label">Deposits</div>
                    <div className="stat-value positive">{formatCurrency(totalDeposits)}</div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-label">Withdrawals</div>
                    <div className="stat-value negative">{formatCurrency(totalWithdrawals)}</div>
                </div>
            </div>

            <div className="history-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filter === 'send' ? 'active' : ''}`}
                        onClick={() => setFilter('send')}
                    >
                        Sent
                    </button>
                    <button
                        className={`filter-btn ${filter === 'receive' ? 'active' : ''}`}
                        onClick={() => setFilter('receive')}
                    >
                        Received
                    </button>
                    <button
                        className={`filter-btn ${filter === 'deposit' ? 'active' : ''}`}
                        onClick={() => setFilter('deposit')}
                    >
                        Deposits
                    </button>
                    <button
                        className={`filter-btn ${filter === 'withdraw' ? 'active' : ''}`}
                        onClick={() => setFilter('withdraw')}
                    >
                        Withdrawals
                    </button>
                </div>
            </div>

            <div className="history-list">
                {filteredTransactions.length === 0 ? (
                    <div className="empty-state glass">
                        <div className="empty-icon">📭</div>
                        <h3>No transactions found</h3>
                        <p>Try adjusting your filters or search term</p>
                    </div>
                ) : (
                    filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className={`history-item glass-hover ${getTransactionColor(transaction.type)}`}>
                            <div className="history-icon">
                                {getTransactionIcon(transaction.type)}
                            </div>
                            <div className="history-details">
                                <div className="history-title">
                                    {transaction.type === 'send' && `To ${transaction.recipient}`}
                                    {transaction.type === 'receive' && `From ${transaction.sender}`}
                                    {transaction.type === 'deposit' && 'Deposit'}
                                    {transaction.type === 'withdraw' && 'Withdrawal'}
                                </div>
                                <div className="history-note">{transaction.note}</div>
                                <div className="history-date">{formatDate(transaction.date)}</div>
                            </div>
                            <div className="history-amount">
                                <div className={`amount ${transaction.type === 'send' || transaction.type === 'withdraw' ? 'negative' : 'positive'}`}>
                                    {transaction.type === 'send' || transaction.type === 'withdraw' ? '-' : '+'}
                                    {formatCurrency(transaction.amount)}
                                </div>
                                <div className={`status status-${transaction.status}`}>
                                    {transaction.status}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
