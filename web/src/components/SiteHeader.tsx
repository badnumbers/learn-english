import { Link, useLocation } from 'react-router-dom'
import type { LanguagePageState } from '../pages/LanguagePage'

type SiteHeaderProps = {
  qrOpen: boolean
  onQrClick: () => void
}

function LanguageIcon() {
  return (
    <svg
      className="site-bar-icon"
      viewBox="0 0 24 24"
      width="1.35rem"
      height="1.35rem"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="4"
        ry="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        d="M3 12h18"
      />
    </svg>
  )
}

export function SiteHeader({ qrOpen, onQrClick }: SiteHeaderProps) {
  const location = useLocation()
  const languageState: LanguagePageState =
    location.pathname === '/language'
      ? ((location.state as LanguagePageState | null) ?? {})
      : { from: { pathname: location.pathname, search: location.search } }

  return (
    <header className="site-bar">
      <div className="site-bar-inner">
        <Link className="site-title" to="/">
          Learn English
        </Link>
        <div className="site-bar-actions">
          <Link
            className="site-bar-button"
            to="/language"
            state={languageState}
            aria-label="Language"
            aria-current={location.pathname === '/language' ? 'page' : undefined}
          >
            <LanguageIcon />
          </Link>
          <button
            type="button"
            className="site-bar-button"
            onClick={onQrClick}
            aria-expanded={qrOpen}
            aria-controls="qr-panel"
          >
            QR
          </button>
        </div>
      </div>
    </header>
  )
}
