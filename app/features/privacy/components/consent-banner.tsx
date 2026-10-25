import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import * as m from '~/paraglide/messages.js'

const PRIVACY_VERSION = '1.0.0'
const CONSENT_STORAGE_KEY = 'user-consent'

// Keyframes for slide-up animation
const slideUpAnimation = `
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }
`

export interface ConsentPreferences {
  analytics: boolean
  marketing: boolean
  version: string
  timestamp: number
}

function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function storeConsent(consent: ConsentPreferences) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent))
}

export function ConsentBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const consent = getStoredConsent()
    if (!consent || consent.version !== PRIVACY_VERSION) {
      // Delay showing banner slightly for smoother animation
      setTimeout(() => setIsOpen(true), 100)
    } else {
      // Apply stored preferences
      setAnalytics(consent.analytics)
      setMarketing(consent.marketing)
      loadGTMIfConsented(consent)
    }
  }, [])

  const closeBanner = () => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsAnimatingOut(false)
    }, 300) // Match animation duration
  }

  const handleAcceptAll = () => {
    const consent: ConsentPreferences = {
      analytics: true,
      marketing: true,
      version: PRIVACY_VERSION,
      timestamp: Date.now(),
    }
    storeConsent(consent)
    loadGTMIfConsented(consent)
    closeBanner()
  }

  const handleAcceptSelected = () => {
    const consent: ConsentPreferences = {
      analytics,
      marketing,
      version: PRIVACY_VERSION,
      timestamp: Date.now(),
    }
    storeConsent(consent)
    loadGTMIfConsented(consent)
    closeBanner()
  }

  const handleRejectOptional = () => {
    const consent: ConsentPreferences = {
      analytics: false,
      marketing: false,
      version: PRIVACY_VERSION,
      timestamp: Date.now(),
    }
    storeConsent(consent)
    closeBanner()
  }

  if (!isOpen) return null

  return (
    <>
      <style>{slideUpAnimation}</style>
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white shadow-lg"
        style={{
          animation: isAnimatingOut ? 'slideDown 0.3s ease-out' : 'slideUp 0.3s ease-out',
        }}
      >
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{m.consent_banner_title()}</h2>
              <p className="mt-1 text-sm text-gray-600">{m.consent_banner_description()}</p>

              {showCustomize && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <Checkbox checked disabled id="essential" />
                    <div className="flex-1">
                      <Label htmlFor="essential" className="font-medium">
                        {m.consent_banner_essential_label()}
                      </Label>
                      <p className="text-xs text-gray-600">
                        {m.consent_banner_essential_description()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                    <Checkbox
                      checked={analytics}
                      onCheckedChange={(checked) => setAnalytics(checked === true)}
                      id="analytics"
                    />
                    <div className="flex-1">
                      <Label htmlFor="analytics" className="font-medium">
                        {m.consent_banner_analytics_label()}
                      </Label>
                      <p className="text-xs text-gray-600">
                        {m.consent_banner_analytics_description()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                    <Checkbox
                      checked={marketing}
                      onCheckedChange={(checked) => setMarketing(checked === true)}
                      id="marketing"
                    />
                    <div className="flex-1">
                      <Label htmlFor="marketing" className="font-medium">
                        {m.consent_banner_marketing_label()}
                      </Label>
                      <p className="text-xs text-gray-600">
                        {m.consent_banner_marketing_description()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500">
                <Link to="/privacy" className="underline hover:text-gray-900">
                  Privacy Policy
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={closeBanner}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {!showCustomize ? (
              <>
                <Button type="button" onClick={handleAcceptAll}>
                  {m.consent_banner_accept_all()}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCustomize(true)}>
                  {m.consent_banner_customize()}
                </Button>
                <Button type="button" variant="ghost" onClick={handleRejectOptional}>
                  {m.consent_banner_reject_optional()}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" onClick={handleAcceptSelected}>
                  {m.consent_banner_accept_selected()}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCustomize(false)}>
                  Back
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function loadGTMIfConsented(consent: ConsentPreferences) {
  if (typeof window === 'undefined') return

  // Only load GTM if analytics consent is granted
  if (consent.analytics && !window.dataLayer) {
    // GTM script would be loaded here
    // For now, just initialize dataLayer
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'consent_update',
      analytics_consent: consent.analytics,
      marketing_consent: consent.marketing,
    })
  }
}
