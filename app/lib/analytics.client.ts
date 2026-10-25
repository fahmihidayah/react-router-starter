export type DataLayerEvent = {
  event: string
  [key: string]: unknown
}

declare global {
  interface Window {
    dataLayer: DataLayerEvent[]
  }
}

/**
 * Sends a structured event to Google Tag Manager when it is available.
 * Keep event payloads free of personal data and authentication tokens.
 */
export function trackEvent(event: DataLayerEvent) {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)
}
