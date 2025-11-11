import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
	uz: {
		translation: {
			signIn: 'Kirish',
			email: 'Email',
			password: 'Parol',
			devices: 'Qurilmalar',
			pumps: 'Nasoslar',
			monitoring: 'Monitoring',
			signOut: 'Chiqish',
			device: 'Qurilma',
			heightSetting: 'Balandlik sozlash',
			newHeight: 'Yangi balandlik',
			set: 'Sozlash',
			motorCommands: 'Motor buyruqlari',
			motorOn: 'Motor ON',
			motorOff: 'Motor OFF',
			timerSetting: 'Timer sozlash (soniya)',
			timer: 'Timer',
			setTimer: 'Set Timer',
			status: 'Status',
			connected: 'Ulandi',
			connecting: 'Ulanish kutilyapti...',
			notConnected: 'Ulanmagan',
			waterDepth: 'Suv chuqurligi',
			height: 'Belgilangan balandlik',
			water: 'Suv miqdori',
			power: 'Elektr',
			motorState: 'Motor holati',
			timerRemaining: 'Timer qolgan'
		}
	},
	en: {
		translation: {
			signIn: 'Sign in',
			email: 'Email',
			password: 'Password',
			devices: 'Devices',
			pumps: 'Pumps',
			monitoring: 'Monitoring',
			signOut: 'Sign out',
			device: 'Device',
			heightSetting: 'Height setting',
			newHeight: 'New height',
			set: 'Set',
			motorCommands: 'Motor commands',
			motorOn: 'Motor ON',
			motorOff: 'Motor OFF',
			timerSetting: 'Timer setting (seconds)',
			timer: 'Timer',
			setTimer: 'Set Timer',
			status: 'Status',
			connected: 'Connected',
			connecting: 'Connecting…',
			notConnected: 'Not connected',
			waterDepth: 'Water depth',
			height: 'Target height',
			water: 'Water',
			power: 'Power',
			motorState: 'Motor state',
			timerRemaining: 'Timer remaining'
		}
	}
};

i18n.use(initReactI18next).init({
	resources,
	lng: (localStorage.getItem('lang') as 'uz' | 'en') || 'uz',
	fallbackLng: 'uz',
	interpolation: { escapeValue: false }
});

export default i18n;

