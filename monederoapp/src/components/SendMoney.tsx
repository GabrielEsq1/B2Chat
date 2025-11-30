import { useState } from 'react';
import { User } from '../types';

interface SendMoneyProps {
    user: User;
    onSend: (recipient: string, amount: number, note: string) => void;
    onBack: () => void;
}

export default function SendMoney({ user, onSend, onBack }: SendMoneyProps) {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!recipient || !amount) {
            setError('Please fill in all required fields');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (amountNum > user.balance) {
            setError('Insufficient balance');
            return;
        }

        onSend(recipient, amountNum, note);
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            setRecipient('');
            setAmount('');
            setNote('');
        }, 2000);
    };

    return (
        <div className="transaction-view fade-in">
            <div className="view-header">
                <button className="back-button" onClick={onBack}>
                    ← Back
                </button>
                <h2>Send Money</h2>
            </div>

            <div className="balance-info glass">
                <span>Available Balance:</span>
                <span className="gradient-text">{formatCurrency(user.balance)}</span>
            </div>

            {success ? (
                <div className="success-card glass">
                    <div className="success-icon">✓</div>
                    <h3>Transfer Successful!</h3>
                    <p>Your money has been sent to {recipient}</p>
                    <div className="success-amount gradient-text">{formatCurrency(parseFloat(amount))}</div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="transaction-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="recipient">Recipient *</label>
                        <input
                            id="recipient"
                            type="text"
                            placeholder="Enter name or email"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount">Amount *</label>
                        <div className="amount-input-wrapper">
                            <span className="currency-symbol">$</span>
                            <input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="note">Note (Optional)</label>
                        <textarea
                            id="note"
                            rows={3}
                            placeholder="What's this for?"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <div className="quick-amounts">
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('10')}>$10</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('50')}>$50</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('100')}>$100</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('500')}>$500</button>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Send {amount ? formatCurrency(parseFloat(amount)) : '$0.00'}
                    </button>
                </form>
            )}
        </div>
    );
}
