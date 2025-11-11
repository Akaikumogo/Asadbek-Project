import type { Config } from 'tailwindcss';

export default {
	darkMode: 'class',
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				bg: '#0b1220',
				card: '#111a2b',
				accent: '#22c55e'
			}
		}
	},
	plugins: []
} satisfies Config;

