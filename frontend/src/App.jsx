import { useState, useEffect } from 'react'
import axios from 'axios'
import HealthWidget from './components/HealthWidget'
import CreateTransactionForm from './components/CreateTransactionForm'
import TransactionsTable from './components/TransactionsTable'
import AuthorizePanel from './components/AuthorizePanel'
import LoginPage from './components/LoginPage'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [transactions, setTransactions] = useState([]);
    const [selectedTransactionId, setSelectedTransactionId] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchTransactions();
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token, refreshTrigger]);

    const fetchTransactions = async () => {
        try {
            const res = await axios.get(`${API_BASE}/transactions`);
            // Sort by created_at desc
            const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setTransactions(sorted);
        } catch (err) {
            console.error("Failed to fetch transactions", err);
            // If 403, might be token expired
            if (err.response && (err.response.status === 403 || err.response.status === 401)) {
                handleLogout();
            }
        }
    };

    const handleLogin = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    const handleTransactionCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTransactionAuthorized = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (!token) {
        return <LoginPage apiBase={API_BASE} onLogin={handleLogin} />;
    }

    return (
        <div className="app-container">
            {/* Header */}
            <header className="app-header">
                <div className="header-container">
                    <div className="brand-wrapper">
                        <div className="brand-icon">CP</div>
                        <h1 className="brand-title">CardPay <span className="brand-subtitle">Transaction Processing System</span></h1>
                    </div>
                    <div className="header-actions">
                        <div className="separator"></div>
                        <HealthWidget apiBase={API_BASE} />
                        <div className="separator"></div>
                        <button onClick={handleLogout} className="btn-refresh" style={{ color: 'var(--error)' }}>Logout</button>
                    </div>
                </div>
            </header>

            <main className="main-content space-y-4">

                {/* Top Section: Create & Authorize */}
                <div className="grid-2">
                    <CreateTransactionForm apiBase={API_BASE} onSuccess={handleTransactionCreated} />
                    <AuthorizePanel
                        apiBase={API_BASE}
                        transactions={transactions}
                        selectedId={selectedTransactionId}
                        setSelectedId={setSelectedTransactionId}
                        onSuccess={handleTransactionAuthorized}
                    />
                </div>

                {/* Bottom Section: Extensions/Transactions List */}
                <div className="card">
                    <div className="card-padding" style={{ paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title" style={{ marginBottom: 0 }}>Recent Transactions</h3>
                        <button onClick={fetchTransactions} className="btn-refresh">Refresh</button>
                    </div>
                    <TransactionsTable
                        transactions={transactions}
                        onSelect={(id) => setSelectedTransactionId(id)}
                    />
                </div>
            </main>
        </div>
    )
}

export default App
