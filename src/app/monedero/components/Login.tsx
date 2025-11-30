import { useState } from 'react';
import type { LoginFormData, RegisterFormData } from '../types';

interface LoginProps {
    onLogin: (email: string, password: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [loginForm, setLoginForm] = useState<LoginFormData>({
        email: '',
        password: ''
    });
    const [registerForm, setRegisterForm] = useState<RegisterFormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!loginForm.email || !loginForm.password) {
            setError('Please fill in all fields');
            return;
        }

        if (loginForm.email === 'demo@monedera.com' && loginForm.password === 'demo123') {
            onLogin(loginForm.email, loginForm.password);
        } else {
            setError('Invalid email or password');
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (registerForm.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Simulate successful registration
        onLogin(registerForm.email, registerForm.password);
    };

    return (
        <div className="login-container fade-in">
            <div className="login-card glass">
                <div className="login-header">
                    <h1 className="gradient-text">Monedera</h1>
                    <p>Your Digital Wallet</p>
                </div>

                <div className="login-tabs">
                    <button
                        className={`tab ${isLogin ? 'active' : ''}`}
                        onClick={() => {
                            setIsLogin(true);
                            setError('');
                        }}
                    >
                        Login
                    </button>
                    <button
                        className={`tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => {
                            setIsLogin(false);
                            setError('');
                        }}
                    >
                        Register
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {isLogin ? (
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="demo@monedera.com"
                                value={loginForm.email}
                                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                            Sign In
                        </button>

                        <div className="demo-credentials">
                            <p>Demo Credentials:</p>
                            <p><strong>Email:</strong> demo@monedera.com</p>
                            <p><strong>Password:</strong> demo123</p>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="login-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={registerForm.name}
                                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="reg-email">Email</label>
                            <input
                                id="reg-email"
                                type="email"
                                placeholder="you@example.com"
                                value={registerForm.email}
                                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="reg-password">Password</label>
                            <input
                                id="reg-password"
                                type="password"
                                placeholder="••••••••"
                                value={registerForm.password}
                                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                placeholder="••••••••"
                                value={registerForm.confirmPassword}
                                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                            Create Account
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
