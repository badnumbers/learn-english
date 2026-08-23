import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { QrPanel } from './QrPanel'
import { SiteHeader } from './SiteHeader'
import { usePageHref } from '../hooks/usePageHref'

const QR_GENERATED_KEY = 'learn-english.qr.generated'
const QR_OPEN_KEY = 'learn-english.qr.open'

type AppFrameProps = {
  children: ReactNode
}

function readFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function writeFlag(key: string, value: boolean) {
  try {
    if (value) {
      sessionStorage.setItem(key, '1')
    } else {
      sessionStorage.removeItem(key)
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function AppFrame({ children }: AppFrameProps) {
  const href = usePageHref()
  const [open, setOpen] = useState(() => readFlag(QR_OPEN_KEY))
  const [encodedHref, setEncodedHref] = useState<string | null>(() =>
    readFlag(QR_GENERATED_KEY) ? href : null,
  )

  useEffect(() => {
    writeFlag(QR_OPEN_KEY, open)
  }, [open])

  useEffect(() => {
    if (encodedHref === null) {
      return
    }
    writeFlag(QR_GENERATED_KEY, true)
    if (encodedHref !== href) {
      setEncodedHref(href)
    }
  }, [encodedHref, href])

  function onQrClick() {
    if (open && encodedHref === href) {
      setOpen(false)
      return
    }
    if (encodedHref !== href) {
      setEncodedHref(href)
    }
    setOpen(true)
  }

  return (
    <div className="app-frame">
      <SiteHeader qrOpen={open} onQrClick={onQrClick} />
      {open && encodedHref ? (
        <QrPanel href={encodedHref} onClose={() => setOpen(false)} />
      ) : null}
      <div className="shell">
        <main>{children}</main>
      </div>
    </div>
  )
}
