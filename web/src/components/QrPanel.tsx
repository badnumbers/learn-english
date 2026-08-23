import { QRCodeSVG } from 'qrcode.react'

type QrPanelProps = {
  href: string
  onClose: () => void
}

export function QrPanel({ href, onClose }: QrPanelProps) {
  return (
    <div className="qr-panel" id="qr-panel">
      <div className="qr-panel-inner">
        <QRCodeSVG value={href} size={192} level="M" bgColor="#ffffff" fgColor="#000000" />
        <button type="button" className="qr-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
