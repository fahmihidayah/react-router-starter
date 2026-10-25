import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-v2-script'
const RECAPTCHA_SCRIPT_URL = 'https://www.google.com/recaptcha/api.js?render=explicit'

type Grecaptcha = {
  ready: (callback: () => void) => void
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    },
  ) => number
  reset: (widgetId?: number) => void
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha
  }
}

let recaptchaScriptPromise: Promise<Grecaptcha> | null = null

function loadRecaptcha(): Promise<Grecaptcha> {
  if (window.grecaptcha) return Promise.resolve(window.grecaptcha)
  if (recaptchaScriptPromise) return recaptchaScriptPromise

  const scriptPromise = new Promise<Grecaptcha>((resolve, reject) => {
    const resolveWhenReady = () => {
      if (!window.grecaptcha) {
        reject(new Error('Google reCAPTCHA did not initialize'))
        return
      }

      window.grecaptcha.ready(() => resolve(window.grecaptcha as Grecaptcha))
    }

    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('load', resolveWhenReady, { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Unable to load Google reCAPTCHA')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.id = RECAPTCHA_SCRIPT_ID
    script.src = RECAPTCHA_SCRIPT_URL
    script.async = true
    script.defer = true
    script.addEventListener('load', resolveWhenReady, { once: true })
    script.addEventListener('error', () => reject(new Error('Unable to load Google reCAPTCHA')), {
      once: true,
    })
    document.head.appendChild(script)
  })

  const retryablePromise = scriptPromise.catch((error) => {
    recaptchaScriptPromise = null
    document.getElementById(RECAPTCHA_SCRIPT_ID)?.remove()
    throw error
  })
  recaptchaScriptPromise = retryablePromise

  return retryablePromise
}

export type RecaptchaV2Handle = {
  reset: () => void
}

type RecaptchaV2Props = {
  siteKey: string
  onChange: (token: string | null) => void
  onLoadError?: () => void
  loadErrorMessage: string
  disabled?: boolean
}

export const RecaptchaV2 = forwardRef<RecaptchaV2Handle, RecaptchaV2Props>(function RecaptchaV2(
  { siteKey, onChange, onLoadError, loadErrorMessage, disabled = false },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)
  const onChangeRef = useRef(onChange)
  const onLoadErrorRef = useRef(onLoadError)
  const [hasLoadError, setHasLoadError] = useState(false)

  useEffect(() => {
    onChangeRef.current = onChange
    onLoadErrorRef.current = onLoadError
  }, [onChange, onLoadError])

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetIdRef.current !== null) {
        window.grecaptcha?.reset(widgetIdRef.current)
      }
      onChangeRef.current(null)
    },
  }))

  useEffect(() => {
    let cancelled = false

    loadRecaptcha()
      .then((grecaptcha) => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null) return

        widgetIdRef.current = grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onChangeRef.current(token),
          'expired-callback': () => onChangeRef.current(null),
          'error-callback': () => onChangeRef.current(null),
        })
      })
      .catch(() => {
        if (cancelled) return
        setHasLoadError(true)
        onChangeRef.current(null)
        onLoadErrorRef.current?.()
      })

    return () => {
      cancelled = true
    }
  }, [siteKey])

  if (hasLoadError) {
    return <p className="text-sm text-destructive">{loadErrorMessage}</p>
  }

  return (
    <div
      className={`overflow-x-auto ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      aria-disabled={disabled}
    >
      <div ref={containerRef} className="min-h-[78px]" />
    </div>
  )
})
