import { useState } from 'react';
import { login } from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const location = useLocation() as any;
	const { login: authLogin } = useAuth();

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const token = await login({ email, password });
			authLogin(token);
			const from = location.state?.from?.pathname || '/';
			navigate(from, { replace: true });
		} catch (err: any) {
			setError(err.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="stack" style={{ marginTop: 40 }}>
			<h2>Sign in</h2>
			<form onSubmit={onSubmit} className="stack card">
				<input
					className="input"
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					inputMode="email"
					autoComplete="username"
				/>
				<input
					className="input"
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					autoComplete="current-password"
				/>
				<button className="btn primary" disabled={loading}>
					{loading ? 'Signing in…' : 'Sign in'}
				</button>
				{error && <div className="pill" style={{ background: 'rgba(239,68,68,.15)', borderColor: 'rgba(239,68,68,.3)' }}>{error}</div>}
				<p className="muted" style={{ fontSize: 12 }}>
					Test users must exist in backend DB. The login endpoint returns an access_token.
				</p>
			</form>
		</div>
	);
}

