import { APIError } from 'better-auth'
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'
import {
  type UNSAFE_DataWithResponseInit as DataWithResponseInit,
  data,
  Form,
  Link,
  useActionData,
  useNavigation,
} from 'react-router'
import z from 'zod'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { PasswordInput } from '~/components/ui/password-input'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import { checkRateLimit, rateLimitHeaders } from '~/features/security/rate-limit.server'
import { userContext } from '~/features/users/contexts'
import * as userQueries from '~/features/users/queries'
import { auth } from '~/lib/auth'
import * as m from '~/paraglide/messages.js'
import type { Route } from './+types/settings.change-password'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    action: PERMISSION_KEYS.ACCOUNT_UPDATE,
    loader: PERMISSION_KEYS.ACCOUNT_UPDATE,
  }),
]

function createChangePasswordSchema() {
  return z
    .object({
      currentPassword: z.string().min(1, m.change_password_validation_current_required()),
      newPassword: z
        .string()
        .min(8, m.change_password_validation_new_min())
        .max(128, m.change_password_validation_new_max()),
      confirmPassword: z.string().min(1, m.change_password_validation_confirm_required()),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: m.change_password_validation_mismatch(),
      path: ['confirmPassword'],
    })
}

type ChangePasswordActionData =
  | { success: true }
  | {
      success: false
      errors: {
        currentPassword?: string[]
        newPassword?: string[]
        confirmPassword?: string[]
        form?: string[]
      }
    }

export function meta() {
  return [
    { title: m.change_password_meta_title() },
    { name: 'description', content: m.change_password_meta_description() },
  ]
}

export async function loader({ context }: Route.LoaderArgs) {
  const authSession = context.get(userContext)
  if (!authSession?.user) throw data(null, { status: 401 })

  const hasOAuthAccount = await userQueries.hasAnyOAuthProvider(authSession.user.id)

  if (hasOAuthAccount) {
    throw data(null, { status: 403 })
  }

  return null
}

export async function action({
  context,
  request,
}: Route.ActionArgs): Promise<
  ChangePasswordActionData | DataWithResponseInit<ChangePasswordActionData>
> {
  const userId = context.get(userContext)?.user?.id
  if (!userId) {
    return data<ChangePasswordActionData>(
      { success: false, errors: { form: [m.change_password_error()] } },
      { status: 401 },
    )
  }

  const hasOAuthAccount = await userQueries.hasAnyOAuthProvider(userId)
  if (hasOAuthAccount) {
    return data<ChangePasswordActionData>(
      { success: false, errors: { form: [m.change_password_error()] } },
      { status: 403 },
    )
  }

  const formData = await request.formData()
  const result = createChangePasswordSchema().safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors }
  }

  const limit = await checkRateLimit(request, {
    max: 5,
    scope: 'change-password',
    subjects: userId ? [userId] : [],
    windowSeconds: 15 * 60,
  })
  if (!limit.allowed) {
    return data<ChangePasswordActionData>(
      { success: false, errors: { form: [m.auth_rate_limit_exceeded()] } },
      { status: 429, headers: rateLimitHeaders(limit.retryAfterSeconds) },
    )
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword,
        revokeOtherSessions: false,
      },
      headers: request.headers,
    })

    return { success: true }
  } catch (error) {
    if (error instanceof APIError && error.body?.code === 'INVALID_PASSWORD') {
      return {
        success: false,
        errors: { currentPassword: [m.change_password_current_incorrect()] },
      }
    }

    return {
      success: false,
      errors: { form: [m.change_password_error()] },
    }
  }
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null

  return <p className="text-sm text-destructive">{errors[0]}</p>
}

export default function ChangePasswordPage() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSaving = navigation.state === 'submitting'

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-6">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to="/account/settings">
            <ArrowLeft />
            {m.change_password_back_to_settings()}
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{m.change_password_title()}</h1>
          <p className="mt-2 text-muted-foreground">{m.change_password_description()}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-muted-foreground" />
              <div className="space-y-1">
                <CardTitle>{m.change_password_security_title()}</CardTitle>
                <CardDescription>{m.change_password_security_description()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Form method="post">
            <CardContent className="space-y-5">
              {actionData?.success && (
                <div className="flex items-center gap-2 rounded-lg border border-green-600/20 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle2 className="size-4" />
                  {m.change_password_success()}
                </div>
              )}
              {actionData && !actionData.success && actionData.errors.form && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {actionData.errors.form[0]}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="currentPassword">{m.change_password_current_label()}</Label>
                <PasswordInput
                  id="currentPassword"
                  name="currentPassword"
                  autoComplete="current-password"
                  aria-invalid={Boolean(
                    actionData && !actionData.success && actionData.errors.currentPassword?.length,
                  )}
                  required
                />
                {actionData && !actionData.success && (
                  <FieldError errors={actionData.errors.currentPassword} />
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">{m.change_password_new_label()}</Label>
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  aria-invalid={Boolean(
                    actionData && !actionData.success && actionData.errors.newPassword?.length,
                  )}
                  required
                />
                {actionData && !actionData.success && (
                  <FieldError errors={actionData.errors.newPassword} />
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{m.change_password_confirm_label()}</Label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  aria-invalid={Boolean(
                    actionData && !actionData.success && actionData.errors.confirmPassword?.length,
                  )}
                  required
                />
                {actionData && !actionData.success && (
                  <FieldError errors={actionData.errors.confirmPassword} />
                )}
              </div>
            </CardContent>
            <CardFooter className="mt-6 justify-end gap-3 border-t">
              <Button asChild type="button" variant="outline">
                <Link to="/account/settings">{m.change_password_cancel()}</Link>
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? m.change_password_changing() : m.change_password_submit()}
              </Button>
            </CardFooter>
          </Form>
        </Card>
      </div>
    </div>
  )
}
