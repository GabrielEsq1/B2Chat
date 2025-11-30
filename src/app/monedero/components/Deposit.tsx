import { useState } from 'react';
import { User } from '../types';

interface DepositProps {
    user: User;
    onDeposit: (amount: number, method: string) => void;
    onBack: () => void;
}

export default function Deposit({ user, onDeposit, onBack }: DepositProps) {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'bank' | 'card' | 'crypto'>('bank');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!amount) {
            setError('Please enter an amount');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setProcessing(true);
        setTimeout(() => {
            onDeposit(amountNum, method);
            setProcessing(false);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setAmount('');
            }, 2000);
        }, 1500);
    };

    return (
        <div className="transaction-view fade-in">
            <div className="view-header">
                <button className="back-button" onClick={onBack}>
                    ← Back
                </button>
                <h2>Deposit Funds</h2>
            </div>

            <div className="balance-info glass">
                <span>Current Balance:</span>
                <span className="gradient-text">{formatCurrency(user.balance)}</span>
            </div>

            {success ? (
                <div className="success-card glass">
                    <div className="success-icon">✓</div>
                    <h3>Deposit Successful!</h3>
                    <p>Funds added to your account</p>
                    <div className="success-amount gradient-text">{formatCurrency(parseFloat(amount))}</div>
                </div>
            ) : processing ? (
                <div className="processing-card glass">
                    <div className="spinner"></div>
                    <h3>Processing Deposit...</h3>
                    <p>Please wait while we process your {method} deposit</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="transaction-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Deposit Method</label>
                        <div className="method-selector">
                            <button
                                type="button"
                                className={`method-option ${method === 'bank' ? 'active' : ''}`}
                                onClick={() => setMethod('bank')}
                            >
                                <div className="method-icon">🏦</div>
                                <div className="method-name">Bank Transfer</div>
                            </button>
                            <button
                                type="button"
                                className={`method-option ${method === 'card' ? 'active' : ''}`}
                                onClick={() => setMethod('card')}
                            >
                                <div className="method-icon">💳</div>
                                <div className="method-name">Debit Card</div>
                            </button>
                            <button
                                type="button"
                                className={`method-option ${method === 'crypto' ? 'active' : ''}`}
                                onClick={() => setMethod('crypto')}
                            >
                                <div className="method-icon">₿</div>
                                <div className="method-name">Crypto</div>
                            </button>
                        </div>
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

                    <div className="quick-amounts">
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('100')}>$100</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('500')}>$500</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('1000')}>$1,000</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('5000')}>$5,000</button>
                    </div>

                    <button type="submit" className="btn btn-success btn-block">
                        Deposit {amount ? formatCurrency(parseFloat(amount)) : '$0.00'}
                    </button>
                </form>
            )}
        </div>
    );
}
