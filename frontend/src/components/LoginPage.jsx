import { useState } from 'react'
import axios from 'axios'

export default function LoginPage({ apiBase, onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';

        try {
            if (isRegistering) {
                await axios.post(`${apiBase}${endpoint}`, { username, password });
                // If register success, auto login or ask to login
                setIsRegistering(false);
                setError('Registration successful! Please login.'); // Reuse error field for success msg temporarily or use separate state
                setLoading(false);
                return;
            }

            const res = await axios.post(`${apiBase}${endpoint}`, { username, password });
            onLogin(res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Authentication failed');
            setLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', background: 'var(--bg-color)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <div className="brand-wrapper" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                    <div className="brand-icon" style={{ width: '3rem', height: '3rem', fontSize: '1.25rem' }}>CP</div>
                </div>

                <h2 className="card-title" style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {isRegistering ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    {isRegistering ? 'Sign up to manage transactions' : 'Sign in to your CardPay dashboard'}
                </p>

                <form onSubmit={handleSubmit} className="flex-col space-y-4">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className={`badge ${error.includes('successful') ? 'badge-success' : 'badge-error'}`}
                            style={{ display: 'block', padding: '0.75rem', width: '100%', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                        {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                        </span>
                        <button
                            type="button"
                            onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                        >
                            {isRegistering ? 'Sign In' : 'Sign Up'}
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ marginTop: '2rem', color: 'var(--text-light)', fontSize: '0.875rem' }}>
                &copy; 2025 CardPay Inc.
            </div>
        </div>
    );
}
