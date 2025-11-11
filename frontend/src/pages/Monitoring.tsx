import { useEffect, useState } from 'react';
import { MonitoringAPI } from '../api';

export default function Monitoring() {
	const [pumpId, setPumpId] = useState('');
	const [daily, setDaily] = useState<any[]>([]);
	const [monthly, setMonthly] = useState<any[]>([]);
	const [total, setTotal] = useState<{ totalWater: number; totalElectricity: number } | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function load() {
		setError(null);
		try {
			if (pumpId) {
				const d = await MonitoringAPI.daily(pumpId, 30);
				const m = await MonitoringAPI.monthly(pumpId, 12);
				setDaily(d); setMonthly(m);
			}
			const t = await MonitoringAPI.total();
			setTotal(t);
		} catch (e: any) {
			setError(e.message);
		}
	}
	useEffect(() => { load(); }, []); // load totals once

	return (
		<div className="stack">
			<h2>Monitoring</h2>
			<div className="card stack">
				<div className="row">
					<input className="input" placeholder="Pump ID" value={pumpId} onChange={(e) => setPumpId(e.target.value)} />
					<button className="btn" onClick={load}>Load</button>
				</div>
				{error && <div className="pill" style={{ background: 'rgba(239,68,68,.15)', borderColor: 'rgba(239,68,68,.3)' }}>{error}</div>}
			</div>
			{total && (
				<div className="card row" style={{ justifyContent: 'space-between' }}>
					<div>Total water</div><div className="pill">{total.totalWater ?? 0}</div>
					<div>Total electricity</div><div className="pill">{total.totalElectricity ?? 0}</div>
				</div>
			)}
			<div className="grid">
				<div className="card">
					<div className="muted" style={{ marginBottom: 8 }}>Daily</div>
					<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(daily, null, 2)}</pre>
				</div>
				<div className="card">
					<div className="muted" style={{ marginBottom: 8 }}>Monthly</div>
					<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(monthly, null, 2)}</pre>
				</div>
			</div>
		</div>
	);
}

