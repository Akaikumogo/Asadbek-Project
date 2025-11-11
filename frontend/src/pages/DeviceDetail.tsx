import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DevicesAPI } from '../api';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function DeviceDetail() {
	const { id = '' } = useParams();
	const { t } = useTranslation();
	const [device, setDevice] = useState<any | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [height, setHeight] = useState<string>('');
	const [timer, setTimer] = useState<string>('');
	const [busy, setBusy] = useState(false);

	async function load() {
		try {
			const d = await DevicesAPI.get(id);
			setDevice(d);
		} catch (e: any) {
			setError(e.message);
		}
	}
	useEffect(() => {
		load();
		const iv = setInterval(load, 1000);
		return () => clearInterval(iv);
	}, [id]);

	async function sendCommand(cmd: string, pl?: any) {
		setBusy(true);
		setError(null);
		try {
			await DevicesAPI.command({ deviceId: id, command: cmd, payload: pl });
		} catch (e: any) {
			setError(e.message || 'Failed to send command');
		} finally {
			setBusy(false);
		}
	}
	const setDeviceHeight = () => {
		if (!height) return;
		sendCommand('height', { height: Number(height) });
	};
	const setDeviceTimer = () => {
		if (!timer) return;
		sendCommand('timer', { seconds: Number(timer) });
	};

	if (!device) return <div className="muted">Loading… {error && <span>({error})</span>}</div>;
	return (
		<div className="stack">
			<h2 className="text-xl font-semibold">{t('device')}: {device.name || device.deviceName || id}</h2>
			<motion.div className="card stack" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
				<div className="muted">{t('status')}: <span className="font-medium">{device.connected ? `✅ ${t('connected')}` : `⚠️ ${t('notConnected')}`}</span></div>
				<div className="stack">
					<div className="data-item row"><div>{t('waterDepth')}:</div><div id="depth-text" className="pill">{device.waterDepth ?? '--'} cm</div></div>
					<div className="data-item row"><div>{t('height')}:</div><div id="height-text" className="pill">{device.height ?? '--'} cm</div></div>
					<div className="data-item row"><div>{t('water')}:</div><div id="litres-text" className="pill">{device.totalLitres?.toFixed ? device.totalLitres.toFixed(2) : (device.totalLitres ?? '--')} L</div></div>
					<div className="data-item row"><div>{t('power')}:</div><div id="power-text" className="pill">{device.totalElectricity?.toFixed ? device.totalElectricity.toFixed(2) : (device.totalElectricity ?? '--')} kW</div></div>
					<div className="data-item row"><div>{t('motorState')}:</div><div id="motor-text" className="pill">{device.motorState ?? '--'}</div></div>
					<div className="data-item row"><div>{t('timerRemaining')}:</div><div id="timer-text" className="pill">{device.timerRemaining ?? '--:--'}</div></div>
				</div>
			</motion.div>

			<motion.div className="card stack" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
				<h3 className="font-medium">{t('heightSetting')}</h3>
				<div className="row">
					<input className="input" placeholder={`${t('newHeight')} (cm)`} value={height} onChange={(e) => setHeight(e.target.value)} inputMode="numeric" />
					<button className="btn btn-primary" disabled={busy} onClick={setDeviceHeight}>{t('set')}</button>
				</div>
			</motion.div>

			<motion.div className="card stack" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
				<h3 className="font-medium">{t('motorCommands')}</h3>
				<div className="toolbar">
					<button className="btn" disabled={busy} onClick={() => sendCommand('motor', { state: 'ON' })}>{t('motorOn')}</button>
					<button className="btn btn-danger" disabled={busy} onClick={() => sendCommand('motor', { state: 'OFF' })}>{t('motorOff')}</button>
				</div>
			</motion.div>

			<motion.div className="card stack" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
				<h3 className="font-medium">{t('timerSetting')}</h3>
				<div className="row">
					<input className="input" placeholder={`${t('timer')} (s)`} value={timer} onChange={(e) => setTimer(e.target.value)} inputMode="numeric" />
					<button className="btn" disabled={busy} onClick={setDeviceTimer}>{t('setTimer')}</button>
				</div>
			</motion.div>

			<div className="card">
				<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(device, null, 2)}</pre>
			</div>
			{error && <div className="pill mt-2" style={{ background: 'rgba(239,68,68,.15)', borderColor: 'rgba(239,68,68,.3)' }}>{error}</div>}
		</div>
	);
}

