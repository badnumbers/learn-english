import { useEffect, useRef } from 'react'

type PlayButtonProps = {
  audioUrl: string
  label: string
}

function PlayIcon() {
  return (
    <svg
      className="card-play-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  )
}

export function PlayButton({ audioUrl, label }: PlayButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const el = audioRef.current
    if (!el) {
      return
    }
    el.load()
  }, [audioUrl])

  function playAudio() {
    const el = audioRef.current
    if (!el) {
      return
    }
    el.currentTime = 0
    void el.play()
  }

  return (
    <div className="card-play-col">
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      <button
        type="button"
        className="card-play"
        onClick={playAudio}
        aria-label={label}
      >
        <PlayIcon />
      </button>
    </div>
  )
}
