import { useState } from 'react';
import { User } from '../types';

interface WithdrawProps {
    user: User;
    onWithdraw: (amount: number, destination: string) => void;
    onBack: () => void;
}

export default function Withdraw({ user, onWithdraw, onBack }: WithdrawProps) {
    const [amount, setAmount] = useState('');
    const [destination, setDestination] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);

    const FEE_PERCENTAGE = 0.01; // 1% fee

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const calculateFee = (amount: number) => {
        return amount * FEE_PERCENTAGE;
    };

    const calculateTotal = (amount: number) => {
        return amount + calculateFee(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!amount || !destination) {
            setError('Please fill in all required fields');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        const total = calculateTotal(amountNum);
        if (total > user.balance) {
            setError('Insufficient balance (including fees)');
            return;
        }

        setProcessing(true);
        setTimeout(() => {
            onWithdraw(total, destination);
            setProcessing(false);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setAmount('');
                setDestination('');
            }, 2000);
        }, 1500);
    };

    const amountNum = parseFloat(amount) || 0;
    const fee = calculateFee(amountNum);
    const total = calculateTotal(amountNum);

    return (
        <div className="transaction-view fade-in">
            <div className="view-header">
                <button className="back-button" onClick={onBack}>
                    ← Back
                </button>
                <h2>Withdraw Funds</h2>
            </div>

            <div className="balance-info glass">
                <span>Available Balance:</span>
                <span className="gradient-text">{formatCurrency(user.balance)}</span>
            </div>

            {success ? (
                <div className="success-card glass">
                    <div className="success-icon">✓</div>
                    <h3>Withdrawal Successful!</h3>
                    <p>Funds sent to {destination}</p>
                    <div className="success-amount gradient-text">{formatCurrency(amountNum)}</div>
                </div>
            ) : processing ? (
                <div className="processing-card glass">
                    <div className="spinner"></div>
                    <h3>Processing Withdrawal...</h3>
                    <p>Please wait while we process your withdrawal</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="transaction-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="destination">Bank Account / Card *</label>
                        <input
                            id="destination"
                            type="text"
                            placeholder="Enter account number or card"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
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

                    <div className="quick-amounts">
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('100')}>$100</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('500')}>$500</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('1000')}>$1,000</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount(user.balance.toString())}>Max</button>
                    </div>

                    {amountNum > 0 && (
                        <div className="fee-breakdown glass">
                            <div className="fee-row">
                                <span>Withdrawal Amount:</span>
                                <span>{formatCurrency(amountNum)}</span>
                            </div>
                            <div className="fee-row">
                                <span>Processing Fee (1%):</span>
                                <span>{formatCurrency(fee)}</span>
                            </div>
                            <div className="fee-row total">
                                <span>Total Deducted:</span>
                                <span className="gradient-text">{formatCurrency(total)}</span>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-danger btn-block">
                        Withdraw {amount ? formatCurrency(amountNum) : '$0.00'}
                    </button>
                </form>
            )}
        </div>
    );
}
