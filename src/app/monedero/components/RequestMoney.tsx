import { useState } from 'react';

interface RequestMoneyProps {
    onBack: () => void;
}

export default function RequestMoney({ onBack }: RequestMoneyProps) {
    const [requester, setRequester] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
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

        if (!requester || !amount) {
            setError('Please fill in all required fields');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setSuccess(true);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`https://monedera.app/pay/${Math.random().toString(36).substr(2, 9)}`);
    };

    return (
        <div className="transaction-view fade-in">
            <div className="view-header">
                <button className="back-button" onClick={onBack}>
                    ← Back
                </button>
                <h2>Request Money</h2>
            </div>

            {success ? (
                <div className="success-card glass">
                    <div className="qr-code-placeholder">
                        <div className="qr-grid">
                            {[...Array(64)].map((_, i) => (
                                <div key={i} className={`qr-pixel ${Math.random() > 0.5 ? 'active' : ''}`} />
                            ))}
                        </div>
                    </div>
                    <h3>Request Created!</h3>
                    <p>Requesting {formatCurrency(parseFloat(amount))} from {requester}</p>
                    <div className="share-options">
                        <button className="btn btn-primary" onClick={handleCopyLink}>
                            Copy Payment Link
                        </button>
                        <button className="btn btn-secondary" onClick={() => setSuccess(false)}>
                            Create Another
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="transaction-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="requester">Request From *</label>
                        <input
                            id="requester"
                            type="text"
                            placeholder="Enter name or email"
                            value={requester}
                            onChange={(e) => setRequester(e.target.value)}
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
                        <label htmlFor="reason">Reason (Optional)</label>
                        <textarea
                            id="reason"
                            rows={3}
                            placeholder="What's this for?"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <div className="quick-amounts">
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('10')}>$10</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('50')}>$50</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('100')}>$100</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAmount('500')}>$500</button>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Create Request
                    </button>
                </form>
            )}
        </div>
    );
}
