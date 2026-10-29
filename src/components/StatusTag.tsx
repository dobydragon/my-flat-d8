import { useLang } from '../i18n/LangContext';
import type { Status } from '../data/apartment';
import type { Confidence } from '../data/geometry';

export function StatusTag({ status }: { status: Status }) {
  const { t } = useLang();
  return <span className={`status ${status}`}>{t(`status.${status}`)}</span>;
}

export function ConfidenceTag({ c }: { c: Confidence }) {
  const { t } = useLang();
  return <span className={`status ${c === 'source' ? 'source' : c}`}>{t(`conf.${c}`)}</span>;
}
