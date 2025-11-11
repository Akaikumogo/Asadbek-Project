import { Navigate, Route, Routes, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Devices from './pages/Devices';
import DeviceDetail from './pages/DeviceDetail';
import Pumps from './pages/Pumps';
import PumpDetail from './pages/PumpDetail';
import Monitoring from './pages/Monitoring';
import SplashScreen from './components/SplashScreen';
import { signOut } from './api';
import { motion } from 'framer-motion';

function Protected({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export default function App() {
  const { t, i18n } = useTranslation();
  const { isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState<string>(
    () =>
      localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light')
  );
  
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowSplash(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading || showSplash) {
    return <SplashScreen />;
  }

  function switchLang() {
    const next = i18n.language === 'uz' ? 'en' : 'uz';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner container">
          <div className="brand">NASOSS</div>
          <div className="toolbar">
            <Link className="btn btn-ghost" to="/devices">
              {t('devices')}
            </Link>
            <Link className="btn btn-ghost" to="/pumps">
              {t('pumps')}
            </Link>
            <Link className="btn btn-ghost" to="/monitoring">
              {t('monitoring')}
            </Link>
            <button className="btn" onClick={switchLang}>
              {i18n.language.toUpperCase()}
            </button>
            <button
              className="btn"
              onClick={() => setTheme((p) => (p === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button
              className="btn"
              onClick={() => {
                signOut();
                location.href = '/login';
              }}
            >
              {t('signOut')}
            </button>
          </div>
        </div>
      </nav>
      <main className="container" style={{ paddingTop: 16 }}>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <Protected>
                  <Devices />
                </Protected>
              }
            />
            <Route
              path="/devices"
              element={
                <Protected>
                  <Devices />
                </Protected>
              }
            />
            <Route
              path="/devices/:id"
              element={
                <Protected>
                  <DeviceDetail />
                </Protected>
              }
            />
            <Route
              path="/pumps"
              element={
                <Protected>
                  <Pumps />
                </Protected>
              }
            />
            <Route
              path="/pumps/:id"
              element={
                <Protected>
                  <PumpDetail />
                </Protected>
              }
            />
            <Route
              path="/monitoring"
              element={
                <Protected>
                  <Monitoring />
                </Protected>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </main>
    </>
  );
}
