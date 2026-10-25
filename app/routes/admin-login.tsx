import { ShieldCheck } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { PasswordInput } from '~/components/ui/password-input'
import { RecaptchaV2, type RecaptchaV2Handle } from '~/features/auth/components/recaptcha-v2'
import { getPublicAuthFeatureConfig } from '~/features/auth/config.server'
import {
  getEmailVerificationPath,
  isEmailNotVerifiedError,
} from '~/features/auth/email-verification'
import { redirectAuthenticatedUser } from '~/features/auth/loaders/redirect-authenticated-user'
import { authClient } from '~/lib/auth-client'
import type { ApiResponse } from '~/lib/types'
import * as m from '~/paraglide/messages.js'
import type { Route } from './+types/admin-login'

type CurrentUserResponse = ApiResponse<{
  user: {
    role: { key: string } | null
  }
}>

export async function loader({ request }: Route.LoaderArgs) {
  await redirectAuthenticatedUser(request)
  return getPublicAuthFeatureConfig()
}

export function meta() {
  return [
    { title: m.admin_login_meta_title() },
    { name: 'description', content: m.admin_login_meta_description() },
  ]
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

export default function AdminLogin({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
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
        toast.error(m.admin_login_failed_title(), {
          description: isRateLimitError(response.error)
            ? m.auth_rate_limit_exceeded()
            : isCaptchaError(response.error)
              ? m.auth_captcha_failed()
              : m.login_invalid_credentials(),
        })
        recaptchaRef.current?.reset()
        return
      }

      const currentUserResponse = await fetch('/api/users/me', {
        headers: { Accept: 'application/json' },
      })
      const currentUser = (await currentUserResponse.json()) as CurrentUserResponse

      if (!currentUserResponse.ok || !currentUser.success || !currentUser.data?.user) {
        throw new Error('Unable to determine the signed-in user role')
      }

      if (currentUser.data.user.role?.key !== 'admin') {
        await authClient.signOut()
        toast.error(m.admin_login_not_admin())
        recaptchaRef.current?.reset()
        return
      }

      toast.success(m.admin_login_success_title(), {
        description: m.admin_login_success_description(),
      })

      navigate('/admin', { replace: true })
    } catch {
      toast.error(m.admin_login_failed_title(), {
        description: m.login_unexpected_error(),
      })
      recaptchaRef.current?.reset()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 px-4 py-10">
      <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
        {m.admin_login_badge()}
      </div>

      <Card className="w-full max-w-md gap-0 border-border/80 py-0 shadow-xl shadow-primary/5">
        <CardHeader className="space-y-2 px-6 pb-6 pt-6 sm:px-8 sm:pt-8">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {m.admin_login_title()}
          </CardTitle>
          <CardDescription className="text-sm leading-6">
            {m.admin_login_description()}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <Label htmlFor="email">{m.auth_email()}</Label>
                <Input
                  className="h-11"
                  id="email"
                  type="email"
                  placeholder={m.auth_email_placeholder()}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="email"
                  required
                  disabled={isLoading}
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
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
              </div>
              {loaderData.recaptcha.enabled ? (
                <RecaptchaV2
                  ref={recaptchaRef}
                  siteKey={loaderData.recaptcha.siteKey}
                  onChange={setCaptchaResponse}
                  onLoadError={() => toast.error(m.auth_captcha_load_failed())}
                  loadErrorMessage={m.auth_captcha_load_failed()}
                  disabled={isLoading}
                />
              ) : null}
              <Button type="submit" size="lg" className="mt-1 w-full" disabled={isLoading}>
                {isLoading ? m.admin_login_submitting() : m.admin_login_submit()}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          {m.admin_login_user_sign_in()}
        </Link>
        <Link to="/" className="hover:underline">
          {m.auth_back_to_home()}
        </Link>
      </div>
    </main>
  )
}
