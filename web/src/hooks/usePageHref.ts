import { useSyncExternalStore } from 'react'

const LOCATION_EVENT = 'learn-english-location'

let historyPatched = false

function notifyLocation() {
  window.dispatchEvent(new Event(LOCATION_EVENT))
}

function patchHistory() {
  if (historyPatched) {
    return
  }
  historyPatched = true
  const pushState = history.pushState.bind(history)
  const replaceState = history.replaceState.bind(history)
  history.pushState = (...args) => {
    pushState(...args)
    notifyLocation()
  }
  history.replaceState = (...args) => {
    replaceState(...args)
    notifyLocation()
  }
}

function pageHref(): string {
  return window.location.href
}

function subscribeToHref(onChange: () => void): () => void {
  patchHistory()
  const navigation = (window as Window & { navigation?: EventTarget }).navigation
  window.addEventListener(LOCATION_EVENT, onChange)
  window.addEventListener('popstate', onChange)
  window.addEventListener('hashchange', onChange)
  navigation?.addEventListener('currententrychange', onChange)
  navigation?.addEventListener('navigate', onChange)
  return () => {
    window.removeEventListener(LOCATION_EVENT, onChange)
    window.removeEventListener('popstate', onChange)
    window.removeEventListener('hashchange', onChange)
    navigation?.removeEventListener('currententrychange', onChange)
    navigation?.removeEventListener('navigate', onChange)
  }
}

/** The live document URL, including query string. */
export function usePageHref(): string {
  return useSyncExternalStore(subscribeToHref, pageHref, pageHref)
}
