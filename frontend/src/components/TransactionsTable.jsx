export default function TransactionsTable({ transactions, onSelect }) {
    if (!transactions.length) {
        return <div className="p-8 text-center text-gray-500">No transactions found. Create one to get started.</div>;
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700';
            case 'DECLINED': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Merchant</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.id}>
                            <td className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                                <span style={{ marginRight: '0.5rem' }}>{tx.id.substring(0, 8)}...</span>
                                <button onClick={() => copyToClipboard(tx.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-light)' }} title="Copy ID">
                                    📋
                                </button>
                            </td>
                            <td>{tx.userId}</td>
                            <td>{tx.merchant}</td>
                            <td style={{ fontWeight: 500 }}>{tx.amount} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.currency}</span></td>
                            <td>
                                <span className={`badge ${tx.status === 'APPROVED' ? 'badge-success' : tx.status === 'DECLINED' ? 'badge-error' : 'badge-warning'}`}>
                                    {tx.status}
                                </span>
                            </td>
                            <td style={{ color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                            <td style={{ textAlign: 'right' }}>
                                <button
                                    onClick={() => onSelect(tx.id)}
                                    className="table-action-btn"
                                >
                                    Select
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
