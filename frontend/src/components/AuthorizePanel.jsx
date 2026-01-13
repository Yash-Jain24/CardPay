import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AuthorizePanel({ apiBase, transactions, selectedId, setSelectedId, onSuccess }) {
    const [idempotencyKey, setIdempotencyKey] = useState('test-key-123');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        if (selectedId) {
            // Auto-generate a fresh random key when a new ID is selected for convenience
            setIdempotencyKey(`key-${Math.floor(Math.random() * 10000)}`);
            setResults(null);
        }
    }, [selectedId]);

    const handleAuthorize = async () => {
        if (!selectedId) return;
        setLoading(true);
        setResults(null);
        try {
            const res = await axios.post(`${apiBase}/transactions/${selectedId}/authorize`, {}, {
                headers: { 'Idempotency-Key': idempotencyKey }
            });
            setResults([{ status: res.status, data: res.data, time: new Date().toLocaleTimeString() }]);
            onSuccess();
        } catch (err) {
            setResults([{ status: err.response?.status || 500, error: err.response?.data || err.message }]);
        } finally {
            setLoading(false);
        }
    };

    const handleStressTest = async () => {
        if (!selectedId) return;
        setLoading(true);
        setResults(null);

        const requests = Array(5).fill(null).map((_, i) =>
            axios.post(`${apiBase}/transactions/${selectedId}/authorize`, {}, {
                headers: { 'Idempotency-Key': idempotencyKey }
            })
                .then(res => ({ status: res.status, data: res.data, index: i }))
                .catch(err => ({ status: err.response?.status || 500, error: err.response?.data || err.message, index: i }))
        );

        const responses = await Promise.all(requests);
        setResults(responses);
        onSuccess();
        setLoading(false);
    };

    return (
        <div className="card card-padding flex-col" style={{ height: '100%' }}>
            <h2 className="card-title">Authorize Transaction</h2>

            <div className="flex-col" style={{ flex: 1, gap: '1rem' }}>
                <div className="form-group">
                    <label className="form-label">Transaction ID</label>
                    <select
                        className="form-select"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                    >
                        <option value="">-- Select Transaction --</option>
                        {transactions.map(t => (
                            <option key={t.id} value={t.id}>{t.id} ({t.amount} {t.currency})</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Idempotency Key</label>
                    <div className="flex-row gap-2">
                        <input
                            type="text"
                            className="form-input font-mono"
                            style={{ fontFamily: 'monospace' }}
                            value={idempotencyKey}
                            onChange={(e) => setIdempotencyKey(e.target.value)}
                        />
                        <button
                            onClick={() => setIdempotencyKey(`key-${Math.floor(Math.random() * 10000)}`)}
                            className="btn btn-secondary"
                            title="Generate Random Key"
                        >
                            ↻
                        </button>
                    </div>
                </div>

                <div className="grid-cols-2-gap-4" style={{ marginTop: '1rem' }}>
                    <button
                        onClick={handleAuthorize}
                        disabled={!selectedId || loading}
                        className="btn btn-dark"
                        style={{ width: '100%' }}
                    >
                        Authorize (Once)
                    </button>
                    <button
                        onClick={handleStressTest}
                        disabled={!selectedId || loading}
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                    >
                        ⚡ Idempotency (5x)
                    </button>
                </div>
            </div>

            {/* Results Area */}
            {results && (
                <div className="mt-6">
                    <h4 className="card-title" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Results</h4>
                    <div className="results-box">
                        {results.length === 1 ? (
                            <pre>{JSON.stringify(results[0].data || results[0].error, null, 2)}</pre>
                        ) : (
                            <div className="flex-col gap-2">
                                {results.map((r, i) => (
                                    <div key={i} style={{ color: r.status === 200 ? 'var(--success)' : 'var(--error)' }}>
                                        Request #{i + 1}: Status {r.status}
                                    </div>
                                ))}
                                <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic', borderTop: '1px solid #334155', paddingTop: '0.25rem' }}>
                                    Check backend logs for verify locking
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
