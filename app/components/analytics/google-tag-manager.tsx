import { useEffect } from 'react'
import { useLocation } from 'react-router'

import { trackEvent } from '~/lib/analytics.client'

type GoogleTagManagerProps = {
  containerId?: string
}

export function GoogleTagManagerHead({ containerId }: GoogleTagManagerProps) {
  if (!containerId) return null

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Google's static loader only interpolates a server-validated ID.
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');`,
      }}
    />
  )
}

export function GoogleTagManagerNoScript({ containerId }: GoogleTagManagerProps) {
  if (!containerId) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
        height="0"
        width="0"
        title="Google Tag Manager"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}

export function GoogleTagManagerPageViews({ containerId }: GoogleTagManagerProps) {
  const location = useLocation()

  useEffect(() => {
    if (!containerId) return

    // Do not include the search string: this app has token-bearing URLs, and
    // secrets or personal data must never be sent to analytics.
    trackEvent({
      event: 'virtual_page_view',
      page_location: `${window.location.origin}${location.pathname}`,
      page_path: location.pathname,
      page_title: document.title,
    })
  }, [containerId, location.pathname])

  return null
}
