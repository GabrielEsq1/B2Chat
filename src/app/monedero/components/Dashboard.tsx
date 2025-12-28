import { User, Transaction } from '../types';

interface DashboardProps {
    user: User;
    transactions: Transaction[];
    onNavigate: (view: any) => void;
}

export default function Dashboard({ user, transactions, onNavigate }: DashboardProps) {
    const recentTransactions = transactions.slice(0, 5);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
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

    return (
        <div className="dashboard fade-in">
            <div className="dashboard-header">
                <div>
                    <h2>Welcome back, {user.name}!</h2>
                    <p className="account-number">Account: {user.accountNumber}</p>
                </div>
            </div>

            <div className="balance-card glass">
                <div className="balance-label">Total Balance</div>
                <div className="balance-amount gradient-text">{formatCurrency(user.balance)}</div>
                <div className="balance-subtext">Available to spend</div>
            </div>

            <div className="quick-actions">
                <button className="action-card glass-hover" onClick={() => onNavigate('send')}>
                    <div className="action-icon gradient-primary">↗</div>
                    <div className="action-label">Send</div>
                </button>
                <button className="action-card glass-hover" onClick={() => onNavigate('request')}>
                    <div className="action-icon gradient-primary">↙</div>
                    <div className="action-label">Request</div>
                </button>
                <button className="action-card glass-hover" onClick={() => onNavigate('deposit')}>
                    <div className="action-icon gradient-accent">⬇</div>
                    <div className="action-label">Deposit</div>
                </button>
                <button className="action-card glass-hover" onClick={() => onNavigate('withdraw')}>
                    <div className="action-icon gradient-accent">⬆</div>
                    <div className="action-label">Withdraw</div>
                </button>
            </div>

            <div className="recent-transactions">
                <div className="section-header">
                    <h3>Recent Transactions</h3>
                    <button className="link-button" onClick={() => onNavigate('history')}>
                        View All →
                    </button>
                </div>

                <div className="transactions-list">
                    {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="transaction-item glass-hover">
                            <div className="transaction-icon">
                                {getTransactionIcon(transaction.type)}
                            </div>
                            <div className="transaction-details">
                                <div className="transaction-title">
                                    {transaction.type === 'send' && `To ${transaction.recipient}`}
                                    {transaction.type === 'receive' && `From ${transaction.sender}`}
                                    {transaction.type === 'deposit' && 'Deposit'}
                                    {transaction.type === 'withdraw' && 'Withdrawal'}
                                </div>
                                <div className="transaction-note">{transaction.note}</div>
                            </div>
                            <div className="transaction-right">
                                <div className={`transaction-amount ${transaction.type === 'send' || transaction.type === 'withdraw' ? 'negative' : 'positive'}`}>
                                    {transaction.type === 'send' || transaction.type === 'withdraw' ? '-' : '+'}
                                    {formatCurrency(transaction.amount)}
                                </div>
                                <div className="transaction-date">{formatDate(transaction.date)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
