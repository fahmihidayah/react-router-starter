import { APIError } from 'better-auth'
import { CheckCircle2, KeyRound, Mail, Trash2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  type UNSAFE_DataWithResponseInit as DataWithResponseInit,
  data,
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
  useOutlet,
} from 'react-router'
import z from 'zod'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { PasswordInput } from '~/components/ui/password-input'
import { isEmailConfigured, withEmailLocale } from '~/features/email/index.server'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import { checkRateLimit, rateLimitHeaders } from '~/features/security/rate-limit.server'
import { userContext } from '~/features/users/contexts'
import * as userQueries from '~/features/users/queries'
import { createUpdateUserSchema } from '~/features/users/schemas/form/user-schema'
import * as userService from '~/features/users/services'
import { auth } from '~/lib/auth'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { Route } from './+types/settings'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    action: PERMISSION_KEYS.ACCOUNT_UPDATE,
    intents: {
      deleteAccount: PERMISSION_KEYS.ACCOUNT_DELETE,
      requestEmailChange: PERMISSION_KEYS.ACCOUNT_UPDATE,
      updateProfile: PERMISSION_KEYS.ACCOUNT_UPDATE,
    },
    loader: PERMISSION_KEYS.ACCOUNT_READ,
  }),
]

type SettingsActionData =
  | { success: true; intent: 'email-change' | 'profile' }
  | {
      success: false
      intent: 'delete' | 'email-change' | 'profile'
      errors: {
        currentPassword?: string[]
        email?: string[]
        form?: string[]
        name?: string[]
        newEmail?: string[]
      }
    }

export function meta() {
  return [
    { title: m.settings_meta_title() },
    { name: 'description', content: m.settings_meta_description() },
  ]
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const authSession = context.get(userContext)
  if (!authSession?.user) throw redirect('/login')

  const hasOAuthAccount = await userQueries.hasAnyOAuthProvider(authSession.user.id)

  return {
    emailChanged: new URL(request.url).searchParams.get('emailChanged') === 'true',
    hasOAuthAccount,
    user: authSession.user,
  }
}

export async function action({
  context,
  request,
}: Route.ActionArgs): Promise<
  Response | SettingsActionData | DataWithResponseInit<SettingsActionData>
> {
  const authSession = context.get(userContext)
  if (!authSession?.user) throw redirect('/login')

  const formData = await request.formData()
  if (formData.get('intent') === 'deleteAccount') {
    const confirmation = formData.get('confirmation')
    const normalizedConfirmation =
      typeof confirmation === 'string' ? confirmation.trim().toLowerCase() : ''
    if (normalizedConfirmation !== authSession.user.email.trim().toLowerCase()) {
      return {
        success: false,
        intent: 'delete',
        errors: { email: [m.settings_delete_account_confirmation_mismatch()] },
      }
    }

    try {
      await userService.deleteById(authSession.user.id)
    } catch {
      return {
        success: false,
        intent: 'delete',
        errors: { form: [m.settings_delete_account_error()] },
      }
    }

    try {
      const signOutResponse = await auth.api.signOut({
        headers: request.headers,
        asResponse: true,
      })
      return redirect('/login', { headers: signOutResponse.headers })
    } catch {
      return redirect('/login')
    }
  }

  if (formData.get('intent') === 'requestEmailChange') {
    const hasOAuthAccount = await userQueries.hasAnyOAuthProvider(authSession.user.id)
    if (hasOAuthAccount) {
      return data<SettingsActionData>(
        {
          success: false,
          intent: 'email-change',
          errors: { form: [m.settings_email_change_error()] },
        },
        { status: 403 },
      )
    }

    const result = z
      .object({
        currentPassword: z.string().min(1, m.settings_email_change_password_required()),
        newEmail: z.string().trim().email(m.settings_validation_email_invalid()),
      })
      .safeParse(Object.fromEntries(formData))

    if (!result.success) {
      return {
        success: false as const,
        intent: 'email-change' as const,
        errors: result.error.flatten().fieldErrors,
      }
    }

    if (result.data.newEmail.toLowerCase() === authSession.user.email.trim().toLowerCase()) {
      return {
        success: false as const,
        intent: 'email-change' as const,
        errors: { newEmail: [m.settings_email_change_same()] },
      }
    }

    if (!isEmailConfigured()) {
      return {
        success: false as const,
        intent: 'email-change' as const,
        errors: { form: [m.settings_email_change_unavailable()] },
      }
    }

    const limit = await checkRateLimit(request, {
      max: 3,
      scope: 'account-email-change',
      subjects: [authSession.user.id, result.data.newEmail],
      windowSeconds: 15 * 60,
    })
    if (!limit.allowed) {
      return data<SettingsActionData>(
        {
          success: false,
          intent: 'email-change',
          errors: { form: [m.auth_rate_limit_exceeded()] },
        },
        { status: 429, headers: rateLimitHeaders(limit.retryAfterSeconds) },
      )
    }

    try {
      const headers = withEmailLocale(request.headers, getLocale())
      await auth.api.verifyPassword({
        body: { password: result.data.currentPassword },
        headers,
      })
      await auth.api.changeEmail({
        body: {
          callbackURL: '/track-app/settings?emailChanged=true',
          newEmail: result.data.newEmail,
        },
        headers,
      })
      return { success: true as const, intent: 'email-change' as const }
    } catch (error) {
      if (error instanceof APIError && error.body?.code === 'INVALID_PASSWORD') {
        return {
          success: false as const,
          intent: 'email-change' as const,
          errors: { currentPassword: [m.settings_email_change_password_incorrect()] },
        }
      }

      return {
        success: false as const,
        intent: 'email-change' as const,
        errors: { form: [m.settings_email_change_error()] },
      }
    }
  }

  const schema = createUpdateUserSchema({
    nameRequired: m.settings_validation_name_required(),
    nameMax: m.settings_validation_name_max(),
    emailInvalid: m.settings_validation_email_invalid(),
  }).pick({ name: true })
  const result = schema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { success: false, intent: 'profile', errors: result.error.flatten().fieldErrors }
  }

  try {
    await userService.update(authSession.user.id, { name: result.data.name })
    return { success: true, intent: 'profile' }
  } catch {
    return {
      success: false,
      intent: 'profile',
      errors: { form: [m.settings_profile_update_error()] },
    }
  }
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null

  return <p className="text-sm text-destructive">{errors[0]}</p>
}

export default function TrackAppSettings({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const outlet = useOutlet()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const isDeleting =
    navigation.state === 'submitting' && navigation.formData?.get('intent') === 'deleteAccount'
  const isChangingEmail =
    navigation.state === 'submitting' && navigation.formData?.get('intent') === 'requestEmailChange'
  const isSaving =
    navigation.state === 'submitting' && navigation.formData?.get('intent') === 'updateProfile'
  const profileActionData = actionData?.intent === 'profile' ? actionData : undefined
  const emailActionData = actionData?.intent === 'email-change' ? actionData : undefined
  const deleteActionData = actionData?.intent === 'delete' ? actionData : undefined
  const deleteEmailMatches =
    deleteConfirmation.trim().toLowerCase() === loaderData.user.email.trim().toLowerCase()

  useEffect(() => {
    if (deleteActionData) setDeleteDialogOpen(true)
  }, [deleteActionData])
  const initials = loaderData.user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (outlet) return outlet

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{m.settings_title()}</h1>
          <p className="mt-2 text-muted-foreground">{m.settings_description()}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                {initials || <UserRound className="size-5" />}
              </div>
              <div className="space-y-1">
                <CardTitle>{m.settings_profile_title()}</CardTitle>
                <CardDescription>{m.settings_profile_description()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Form method="post">
            <input type="hidden" name="intent" value="updateProfile" />
            <CardContent className="space-y-5">
              {profileActionData?.success && (
                <div className="flex items-center gap-2 rounded-lg border border-green-600/20 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle2 className="size-4" />
                  {m.settings_profile_updated()}
                </div>
              )}
              {profileActionData && !profileActionData.success && profileActionData.errors.form && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {profileActionData.errors.form[0]}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="name">{m.settings_name_label()}</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={loaderData.user.name}
                  autoComplete="name"
                  aria-invalid={Boolean(
                    profileActionData &&
                      !profileActionData.success &&
                      profileActionData.errors.name?.length,
                  )}
                  required
                />
                {profileActionData && !profileActionData.success && (
                  <FieldError errors={profileActionData.errors.name} />
                )}
              </div>
            </CardContent>
            <CardFooter className="mt-6 justify-end border-t">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? m.settings_saving() : m.settings_save_changes()}
              </Button>
            </CardFooter>
          </Form>
        </Card>

        {!loaderData.hasOAuthAccount && (
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 text-muted-foreground" />
                <div className="space-y-1">
                  <CardTitle>{m.settings_email_change_title()}</CardTitle>
                  <CardDescription>{m.settings_email_change_description()}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Form method="post">
              <input type="hidden" name="intent" value="requestEmailChange" />
              <CardContent className="space-y-5">
                {loaderData.emailChanged ? (
                  <div className="flex items-center gap-2 rounded-lg border border-green-600/20 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle2 className="size-4" />
                    {m.settings_email_change_completed()}
                  </div>
                ) : null}
                {emailActionData?.success ? (
                  <div className="flex items-center gap-2 rounded-lg border border-green-600/20 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle2 className="size-4" />
                    {m.settings_email_change_requested()}
                  </div>
                ) : null}
                {emailActionData && !emailActionData.success && emailActionData.errors.form ? (
                  <div
                    className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    role="alert"
                  >
                    {emailActionData.errors.form[0]}
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <Label htmlFor="current-email">{m.settings_email_current()}</Label>
                  <Input id="current-email" value={loaderData.user.email} readOnly disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-email">{m.settings_email_new()}</Label>
                  <Input
                    id="new-email"
                    name="newEmail"
                    type="email"
                    autoComplete="email"
                    aria-invalid={Boolean(
                      emailActionData &&
                        !emailActionData.success &&
                        emailActionData.errors.newEmail?.length,
                    )}
                    required
                    disabled={isChangingEmail}
                  />
                  {emailActionData && !emailActionData.success ? (
                    <FieldError errors={emailActionData.errors.newEmail} />
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email-change-password">
                    {m.settings_email_change_password()}
                  </Label>
                  <PasswordInput
                    id="email-change-password"
                    name="currentPassword"
                    autoComplete="current-password"
                    aria-invalid={Boolean(
                      emailActionData &&
                        !emailActionData.success &&
                        emailActionData.errors.currentPassword?.length,
                    )}
                    required
                    disabled={isChangingEmail}
                  />
                  {emailActionData && !emailActionData.success ? (
                    <FieldError errors={emailActionData.errors.currentPassword} />
                  ) : null}
                </div>
              </CardContent>
              <CardFooter className="mt-6 justify-end border-t">
                <Button type="submit" disabled={isChangingEmail}>
                  {isChangingEmail
                    ? m.settings_email_change_submitting()
                    : m.settings_email_change_submit()}
                </Button>
              </CardFooter>
            </Form>
          </Card>
        )}

        {!loaderData.hasOAuthAccount && (
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 size-5 text-muted-foreground" />
                <div className="space-y-1">
                  <CardTitle>{m.settings_password_title()}</CardTitle>
                  <CardDescription>{m.settings_password_description()}</CardDescription>
                </div>
              </div>
              <CardAction>
                <Button asChild variant="outline">
                  <Link to="/track-app/settings/change-password">
                    {m.settings_change_password()}
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
          </Card>
        )}

        <Card className="border-destructive/40">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Trash2 className="mt-0.5 size-5 text-destructive" />
              <div className="space-y-1">
                <CardTitle>{m.settings_delete_account_title()}</CardTitle>
                <CardDescription>{m.settings_delete_account_description()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={(open) => {
                setDeleteDialogOpen(open)
                if (!open) setDeleteConfirmation('')
              }}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 /> {m.settings_delete_account_action()}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{m.settings_delete_account_dialog_title()}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {m.settings_delete_account_dialog_description()}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="deleteAccount" />
                  {deleteActionData && !deleteActionData.success && deleteActionData.errors.form ? (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {deleteActionData.errors.form[0]}
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Label htmlFor="delete-account-email">
                      {m.settings_delete_account_confirmation_label()}
                    </Label>
                    <Input
                      id="delete-account-email"
                      name="confirmation"
                      type="email"
                      value={deleteConfirmation}
                      onChange={(event) => setDeleteConfirmation(event.target.value)}
                      placeholder={loaderData.user.email}
                      autoComplete="off"
                      autoFocus
                      aria-invalid={Boolean(
                        deleteActionData &&
                          !deleteActionData.success &&
                          deleteActionData.errors.email?.length,
                      )}
                    />
                    {deleteActionData && !deleteActionData.success ? (
                      <FieldError errors={deleteActionData.errors.email} />
                    ) : null}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel type="button">{m.settings_cancel()}</AlertDialogCancel>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={!deleteEmailMatches || isDeleting}
                    >
                      {m.settings_delete_account_action()}
                    </Button>
                  </AlertDialogFooter>
                </Form>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
