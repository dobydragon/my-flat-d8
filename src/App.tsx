import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useLang } from './i18n/LangContext';
import { Overview } from './pages/Overview';
import { Plan } from './pages/Plan';
import { Explore } from './pages/Explore';
import { Evidence } from './pages/Evidence';

export function App() {
  const { pathname } = useLocation();
  const { t } = useLang();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <>
      <a className="skip" href="#main" onClick={(e) => (e.preventDefault(), document.getElementById('main')?.focus())}>
        {t('skip')}
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
