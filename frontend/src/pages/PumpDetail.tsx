import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PumpsAPI } from '../api';

export default function PumpDetail() {
	const { id = '' } = useParams();
	const [pump, setPump] = useState<any | null>(null);
	const [cmd, setCmd] = useState('');
	const [payload, setPayload] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [data, setData] = useState<any | null>(null);

	async function load() {
		try {
			const p = await PumpsAPI.get(id);
			setPump(p);
			const d = await PumpsAPI.data(id).catch(() => null);
			setData(d);
		} catch (e: any) {
			setError(e.message);
		}
	}
	useEffect(() => { load(); }, [id]);

	async function send() {
		setBusy(true);
		setError(null);
		try {
			const parsed = payload ? JSON.parse(payload) : {};
			await PumpsAPI.command(id, { cmd, ...parsed });
	+		await load();
		} catch (e: any) {
			setError(e.message);
		} finally {
			setBusy(false);
		}
	}

	if (!pump) return <div className="muted">Loading… {error && <span>({error})</span>}</div>;
	return (
		<div className="stack">
			<h2>Pump: {pump.name || id}</h2>
			<div className="card stack">
				<div className="row">
					<input className="input" placeholder="Command" value={cmd} onChange={(e) => setCmd(e.target.value)} />
					<input className="input" placeholder='Payload JSON' value={payload} onChange={(e) => setPayload(e.target.value)} />
					<button className="btn primary" disabled={busy} onClick={send}>Send</button>
				</div>
				{error && <div className="pill" style={{ background: 'rgba(239,68,68,.15)', borderColor: 'rgba(239,68,68,.3)' }}>{error}</div>}
			</div>
			<div className="grid">
				<div className="card">
					<div className="muted" style={{ marginBottom: 8 }}>Details</div>
					<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(pump, null, 2)}</pre>
				</div>
				<div className="card">
					<div className="muted" style={{ marginBottom: 8 }}>Real-time Data</div>
					<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>
				</div>
			</div>
		</div>
	);
}

