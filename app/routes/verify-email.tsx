import { redirect, useActionData, useNavigation } from 'react-router'
import { AuthShell } from '~/features/auth/components/auth-shell'
import {
  EmailVerificationCard,
  type EmailVerificationState,
} from '~/features/auth/components/email-verification-card'
import { getPostLoginPath } from '~/features/auth/utils/get-post-login-path'
import {
  resendVerificationEmailAction,
  type TResendVerificationActionResponse,
} from '~/features/users/actions/resend-verification-email-action'
import { getSession } from '~/features/users/middlewares'
import * as m from '~/paraglide/messages.js'
import type { Route } from './+types/verify-email'

const expiredErrors = new Set(['TOKEN_EXPIRED'])

function safeEmail(value: string | null): string | undefined {
  const email = value?.trim()
  return email && email.length <= 254 ? email : undefined
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const session = await getSession(request)
  const error = url.searchParams.get('error')?.toUpperCase()
  const successfulCallback = url.searchParams.get('status') === 'success'

  if (session?.user.emailVerified && !successfulCallback && !error) {
    throw redirect(getPostLoginPath(session.user.role))
  }

  let state: EmailVerificationState = 'pending'
  if (session?.user.emailVerified || successfulCallback) state = 'success'
  else if (error) state = expiredErrors.has(error) ? 'expired' : 'invalid'

  return {
    state,
    email: safeEmail(url.searchParams.get('email')) ?? session?.user.email,
    continuePath: session?.user.emailVerified ? getPostLoginPath(session.user.role) : '/login',
  }
}

export function action(args: Route.ActionArgs) {
  return resendVerificationEmailAction(args)
}

export function meta() {
  return [
    { title: m.verification_meta_title() },
    { name: 'description', content: m.verification_meta_description() },
  ]
}

export default function VerifyEmail({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<TResendVerificationActionResponse>()
  const navigation = useNavigation()

  return (
    <AuthShell
      eyebrow={m.verification_info_eyebrow()}
      infoTitle={m.verification_info_title()}
      infoDescription={m.verification_info_description()}
      highlights={[
        m.verification_info_highlight_1(),
        m.verification_info_highlight_2(),
        m.verification_info_highlight_3(),
      ]}
    >
      <EmailVerificationCard
        state={loaderData.state}
        email={loaderData.email}
        continuePath={loaderData.continuePath}
        isSubmitting={navigation.state === 'submitting'}
        response={actionData}
      />
    </AuthShell>
  )
}
