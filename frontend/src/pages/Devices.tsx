import { useEffect, useState } from 'react';
import { DevicesAPI } from '../api';
import { Link } from 'react-router-dom';

export default function Devices() {
	const [devices, setDevices] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [name, setName] = useState('');
	const [site, setSite] = useState('');
	const [error, setError] = useState<string | null>(null);

	async function fetchDevices() {
		setLoading(true);
		setError(null);
		try {
			const list = await DevicesAPI.list();
			setDevices(list);
		} catch (e: any) {
			setError(e.message || 'Failed to load devices');
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		fetchDevices();
	}, []);

	async function createDevice() {
		try {
			await DevicesAPI.create({ name, site });
			setName(''); setSite('');
			fetchDevices();
		} catch (e: any) {
			setError(e.message);
		}
	}

	return (
		<div className="stack">
			<h2>Devices</h2>
			<div className="card stack">
				<div className="row">
					<input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
					<input className="input" placeholder="Site" value={site} onChange={(e) => setSite(e.target.value)} />
					<button className="btn primary" onClick={createDevice}>Add</button>
				</div>
				{error && <div className="pill" style={{ background: 'rgba(239,68,68,.15)', borderColor: 'rgba(239,68,68,.3)' }}>{error}</div>}
			</div>
			{loading ? (
				<div className="muted">Loading…</div>
			) : (
				<div className="list">
					{devices.map((d) => (
						<div key={d.id || d._id} className="card row">
							<div className="stack" style={{ gap: 2 }}>
								<div style={{ fontWeight: 600 }}>{d.name || d.deviceName || '(no name)'}</div>
								<div className="muted" style={{ fontSize: 12 }}>{d.site || d.location || ''}</div>
							</div>
							<div className="toolbar">
								<Link className="btn" to={`/devices/${d.id || d._id}`}>Open</Link>
								<button className="btn danger" onClick={async () => { await DevicesAPI.remove(d.id || d._id); fetchDevices(); }}>Delete</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

