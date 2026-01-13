import { useState, useEffect } from 'react'
import axios from 'axios'

export default function HealthWidget({ apiBase }) {
    const [status, setStatus] = useState('checking');

    const checkHealth = async () => {
        try {
            await Promise.all([
                axios.get(`${apiBase}/api/health`),
                axios.get(`${apiBase}/actuator/health`)
            ]);
            setStatus('online');
        } catch (err) {
            setStatus('offline');
        }
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [apiBase]);

    if (status === 'checking') return <span style={{ color: 'var(--text-light)' }}>Checking...</span>;

    return (
        <div className={`flex flex-col items-center gap-1 ${status === 'online' ? 'status-online' : 'status-offline'}`}>
            <span className="health-dot">
                <span className="health-ping"></span>
                <span className="health-solid"></span>
            </span>
            <span className={`text-sm font-medium ${status === 'online' ? 'text-green-700' : 'text-red-700'}`}>
                {status === 'online' ? 'System Online' : 'System Offline'}
            </span>
        </div>
    )
}
