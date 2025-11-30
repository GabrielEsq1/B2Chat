import { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SendMoney from './components/SendMoney';
import RequestMoney from './components/RequestMoney';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import History from './components/History';
import { User, Transaction, ViewType } from './types';
import { mockUser, mockTransactions } from './utils/mockData';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User>(mockUser);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

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

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
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
            <span className="nav-label">Send Money</span>
          </button>
          <button
            className={`nav-item ${currentView === 'request' ? 'active' : ''}`}
            onClick={() => handleNavigate('request')}
          >
            <span className="nav-icon">↙</span>
            <span className="nav-label">Request</span>
          </button>
          <button
            className={`nav-item ${currentView === 'deposit' ? 'active' : ''}`}
            onClick={() => handleNavigate('deposit')}
          >
            <span className="nav-icon">⬇</span>
            <span className="nav-label">Deposit</span>
          </button>
          <button
            className={`nav-item ${currentView === 'withdraw' ? 'active' : ''}`}
            onClick={() => handleNavigate('withdraw')}
          >
            <span className="nav-icon">⬆</span>
            <span className="nav-label">Withdraw</span>
          </button>
          <button
            className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => handleNavigate('history')}
          >
            <span className="nav-icon">📜</span>
            <span className="nav-label">History</span>
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
          <button className="btn btn-secondary btn-block" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        {currentView === 'dashboard' && (
          <Dashboard user={user} transactions={transactions} onNavigate={handleNavigate} />
        )}
        {currentView === 'send' && (
          <SendMoney user={user} onSend={handleSend} onBack={() => handleNavigate('dashboard')} />
        )}
        {currentView === 'request' && (
          <RequestMoney onBack={() => handleNavigate('dashboard')} />
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

export default App;
