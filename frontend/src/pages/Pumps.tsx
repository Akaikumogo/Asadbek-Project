import { useEffect, useState } from 'react';
import { PumpsAPI } from '../api';
import { Link } from 'react-router-dom';

export default function Pumps() {
	const [pumps, setPumps] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [swap, setSwap] = useState({ a: '', b: '' });

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const list = await PumpsAPI.list();
			setPumps(list);
		} catch (e: any) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => { load(); }, []);

	async function doSwap() {
		try {
			await PumpsAPI.swap({ pump1Id: swap.a, pump2Id: swap.b });
			setSwap({ a: '', b: '' });
			load();
		} catch (e: any) {
			setError(e.message);
		}
	}

	return (
		<div className="stack">
			<h2>Pumps</h2>

			<div className="card stack">
				<div className="row">
					<input className="input" placeholder="Pump ID A" value={swap.a} onChange={(e) => setSwap(s => ({ ...s, a: e.target.value }))} />
					<input className="input" placeholder="Pump ID B" value={swap.b} onChange={(e) => setSwap(s => ({ ...s, b: e.target.value }))} />
					<button className="btn" onClick={doSwap}>Swap</button>
				</div>
				{error && <div className="pill" style={{ background: 'rgba(239,68,68,.15)', borderColor: 'rgba(239,68,68,.3)' }}>{error}</div>}
			</div>

			{loading ? (
				<div className="muted">Loading…</div>
			) : (
				<div className="list">
					{pumps.map((p) => (
						<div key={p.id || p._id} className="card row">
							<div className="stack" style={{ gap: 2 }}>
								<div style={{ fontWeight: 600 }}>{p.name || p.pumpName || '(pump)'}</div>
								<div className="muted" style={{ fontSize: 12 }}>role: {p.role} • on: {String(p.on)}</div>
							</div>
							<div className="toolbar">
								<button className="btn" onClick={async () => { await PumpsAPI.toggle(p.id || p._id); load(); }}>
									Toggle
								</button>
								<Link className="btn" to={`/pumps/${p.id || p._id}`}>Open</Link>
								<button className="btn danger" onClick={async () => { await PumpsAPI.remove(p.id || p._id); load(); }}>Delete</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

