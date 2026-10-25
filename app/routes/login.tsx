import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { PasswordInput } from '~/components/ui/password-input'
import { Separator } from '~/components/ui/separator'
import { AuthCard, AuthShell } from '~/features/auth/components/auth-shell'
import { RecaptchaV2, type RecaptchaV2Handle } from '~/features/auth/components/recaptcha-v2'
import { getPublicAuthFeatureConfig } from '~/features/auth/config.server'
import {
  getEmailVerificationPath,
  isEmailNotVerifiedError,
} from '~/features/auth/email-verification'
import { redirectAuthenticatedUser } from '~/features/auth/loaders/redirect-authenticated-user'
import { authClient } from '~/lib/auth-client'
import * as m from '~/paraglide/messages.js'
import type { Route } from './+types/login'

export async function loader({ request }: Route.LoaderArgs) {
  await redirectAuthenticatedUser(request)
  return getPublicAuthFeatureConfig()
}

export function meta() {
  return [
    { title: m.login_meta_title() },
    { name: 'description', content: m.login_meta_description() },
  ]
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.63-2.42l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.88A6.02 6.02 0 0 1 6.07 12c0-.65.11-1.29.32-1.88V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.61Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.99c1.47 0 2.79.5 3.82 1.49l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.61C7.18 7.75 9.39 5.99 12 5.99Z"
      />
    </svg>
  )
}

function isCaptchaError(error: { code?: string; message?: string } | null | undefined) {
  return Boolean(
    error?.code?.toLowerCase().includes('captcha') ||
      error?.message?.toLowerCase().includes('captcha'),
  )
}

function isRateLimitError(
  error: { code?: string; message?: string; status?: number } | null | undefined,
) {
  return Boolean(
    error?.status === 429 ||
      error?.code?.toLowerCase().includes('too_many') ||
      error?.message?.toLowerCase().includes('too many'),
  )
}

export default function Login({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [captchaResponse, setCaptchaResponse] = useState<string | null>(null)
  const recaptchaRef = useRef<RecaptchaV2Handle>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loaderData.recaptcha.enabled && !captchaResponse) {
      toast.error(m.auth_captcha_required())
      return
    }

    setIsLoading(true)

    try {
      const response = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        fetchOptions: loaderData.recaptcha.enabled
          ? { headers: { 'x-captcha-response': captchaResponse as string } }
          : undefined,
      })

      if (response.error) {
        if (isEmailNotVerifiedError(response.error)) {
          toast.error(m.login_email_not_verified())
          navigate(getEmailVerificationPath(formData.email))
          return
        }
        toast.error(m.login_failed_title(), {
          description: isRateLimitError(response.error)
            ? m.auth_rate_limit_exceeded()
            : isCaptchaError(response.error)
              ? m.auth_captcha_failed()
              : m.login_invalid_credentials(),
        })
        recaptchaRef.current?.reset()
        return
      }

      toast.success(m.login_success_title(), {
        description: m.login_success_description(),
      })

      navigate('/account', { replace: true })
    } catch {
      toast.error(m.login_failed_title(), {
        description: m.login_unexpected_error(),
      })
      recaptchaRef.current?.reset()
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (loaderData.recaptcha.enabled && !captchaResponse) {
      toast.error(m.auth_captcha_required())
      return
    }

    setIsGoogleLoading(true)
    try {
      const response = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/account',
        errorCallbackURL: '/login',
        fetchOptions: loaderData.recaptcha.enabled
          ? { headers: { 'x-captcha-response': captchaResponse as string } }
          : undefined,
      })

      if (response.error) {
        toast.error(m.login_failed_title(), {
          description: isRateLimitError(response.error)
            ? m.auth_rate_limit_exceeded()
            : isCaptchaError(response.error)
              ? m.auth_captcha_failed()
              : m.login_unexpected_error(),
        })
        recaptchaRef.current?.reset()
      }
    } catch {
      toast.error(m.login_failed_title(), {
        description: m.login_unexpected_error(),
      })
      recaptchaRef.current?.reset()
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const isBusy = isLoading || isGoogleLoading

  return (
    <AuthShell
      eyebrow={m.login_info_eyebrow()}
      infoTitle={m.login_info_title()}
      infoDescription={m.login_info_description()}
      highlights={[
        m.login_info_highlight_1(),
        m.login_info_highlight_2(),
        m.login_info_highlight_3(),
      ]}
    >
      <AuthCard
        title={m.login_title()}
        description={m.login_description()}
        footer={
          <div className="w-full space-y-3 text-center text-sm text-muted-foreground">
            <p>
              {m.login_no_account()}{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                {m.login_sign_up()}
              </Link>
            </p>
            <Link to="/" className="inline-block font-medium text-primary hover:underline">
              {m.auth_back_to_home()}
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5">
            {loaderData.googleEnabled ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isBusy}
                >
                  <GoogleIcon />
                  {m.auth_continue_with_google()}
                </Button>
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs uppercase text-muted-foreground">{m.auth_or()}</span>
                  <Separator className="flex-1" />
                </div>
              </>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">{m.auth_email()}</Label>
              <Input
                className="h-11"
                id="email"
                type="email"
                placeholder={m.auth_email_placeholder()}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isBusy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{m.auth_password()}</Label>
              <PasswordInput
                className="h-11"
                id="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isBusy}
              />
            </div>
            {loaderData.recaptcha.enabled ? (
              <RecaptchaV2
                ref={recaptchaRef}
                siteKey={loaderData.recaptcha.siteKey}
                onChange={setCaptchaResponse}
                onLoadError={() => toast.error(m.auth_captcha_load_failed())}
                loadErrorMessage={m.auth_captcha_load_failed()}
                disabled={isBusy}
              />
            ) : null}
            <Button type="submit" size="lg" className="mt-1 w-full" disabled={isBusy}>
              {isLoading ? m.login_submitting() : m.auth_sign_in()}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                {m.login_forgot_password()}
              </Link>
            </div>
          </div>
        </form>
      </AuthCard>
    </AuthShell>
  )
}
