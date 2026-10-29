import { useLang } from '../i18n/LangContext';
import { project } from '../data/apartment';
import vialeSvg from '../data/generated/logo-viale.svg?raw';

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="site-footer" style={{ background: 'var(--v-olive)' }}>
      <div className="wrap">
        <div className="footer-grid">
          <span role="img" aria-label="Viàle Residence" style={{ color: 'var(--v-cream)', width: 220, display: 'block' }} dangerouslySetInnerHTML={{ __html: vialeSvg }} />
          <p style={{ margin: 0 }}>{t('footer.note')}</p>
          <p style={{ margin: 0 }}>
            {t('footer.dev')}: <a className="ltr" href={`tel:${project.hotline}`}>{project.hotline}</a>
            <br />
            <a className="ltr" href={`mailto:${project.email}`}>{project.email}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
