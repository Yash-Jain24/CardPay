import { useState } from 'react'
import axios from 'axios'

export default function CreateTransactionForm({ apiBase, onSuccess }) {
    const [form, setForm] = useState({
        userId: 'user-1',
        merchant: 'amazon',
        amount: '499.99',
        currency: 'INR'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(`${apiBase}/transactions`, form);
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card card-padding">
            <h2 className="card-title">Create Transaction</h2>
            <form onSubmit={handleSubmit} className="flex-col space-y-4">
                <div className="grid-cols-2-gap-4">
                    <div className="form-group">
                        <label className="form-label">User ID</label>
                        <input type="text" className="form-input"
                            value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Merchant</label>
                        <input type="text" className="form-input"
                            value={form.merchant} onChange={e => setForm({ ...form, merchant: e.target.value })} />
                    </div>
                </div>
                <div className="grid-cols-2-gap-4">
                    <div className="form-group">
                        <label className="form-label">Amount</label>
                        <input type="number" step="0.01" className="form-input"
                            value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Currency</label>
                        <input type="text" className="form-input"
                            value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
                    </div>
                </div>

                {error && <div className="badge badge-error" style={{ display: 'block', padding: '1rem', width: '100%', borderRadius: '4px' }}>{error}</div>}

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                    {loading ? 'Creating...' : 'Create Transaction'}
                </button>
            </form>
        </div>
    )
}
