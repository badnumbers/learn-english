import { Link } from 'react-router-dom'

type SiteHeaderProps = {
  qrOpen: boolean
  onQrClick: () => void
}

export function SiteHeader({ qrOpen, onQrClick }: SiteHeaderProps) {
  return (
    <header className="site-bar">
      <div className="site-bar-inner">
        <Link className="site-title" to="/">
          Learn English
        </Link>
        <div className="site-bar-actions">
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
