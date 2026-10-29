import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';

const LINKS = [
  ['/', 'nav.overview'],
  ['/plan', 'nav.plan'],
  ['/explore', 'nav.explore'],
  ['/evidence', 'nav.evidence'],
] as const;

export function Header() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="wrap">
        <NavLink to="/" className="brand-text">
          <span className="brand-mark" aria-hidden="true">D8</span>
          <span>{t('brand')}</span>
        </NavLink>
        <nav id="primary-nav" className={`nav${open ? ' open' : ''}`} aria-label={t('nav.primary')}>
          {LINKS.map(([to, key]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="header-tools">
          <button type="button" className="lang-btn" lang={lang === 'en' ? 'ar' : 'en'} aria-label={t('lang.aria')} onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
            {t('lang.other')}
          </button>
          <button type="button" className="menu-btn" aria-expanded={open} aria-controls="primary-nav" aria-label={t('nav.primary')} onClick={() => setOpen((o) => !o)}>
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
