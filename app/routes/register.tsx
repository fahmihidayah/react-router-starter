import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  type ActionFunctionArgs,
  data,
  Link,
  Form as ReactRouterForm,
  redirect,
  useActionData,
  useSubmit,
} from 'react-router'
import { toast } from 'sonner'
import z from 'zod'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { PasswordInput } from '~/components/ui/password-input'
import { AuthCard, AuthShell } from '~/features/auth/components/auth-shell'
import { RecaptchaV2, type RecaptchaV2Handle } from '~/features/auth/components/recaptcha-v2'
import { getPublicAuthFeatureConfig } from '~/features/auth/config.server'
import { getEmailVerificationPath } from '~/features/auth/email-verification'
import { registerUserAction } from '~/features/users/actions/register-user-action'
import { countAdmin } from '~/features/users/queries'
import { createRegisterUserSchema } from '~/features/users/schemas/form/user-schema'
import * as m from '~/paraglide/messages.js'
import type { Route } from './+types/register'

function createRegisterSchema() {
  return createRegisterUserSchema({
    nameRequired: m.register_validation_name_required(),
    nameMax: m.register_validation_name_max(),
    emailInvalid: m.register_validation_email(),
    passwordMin: m.register_validation_password_min(),
    passwordMax: m.register_validation_password_max(),
  })
    .extend({
      confirmPassword: z.string().min(1, m.register_validation_confirm_password()),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: m.register_validation_password_mismatch(),
      path: ['confirmPassword'],
    })
}

type RegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>

type ActionResponse = {
  success: false
  error: string
}

export async function action(args: ActionFunctionArgs) {
  const result = await registerUserAction(args)

  if (!result.success) {
    return data<ActionResponse>({ success: false, error: result.error }, { status: result.status })
  }

  const verificationPath = getEmailVerificationPath(result.email)
  return result.setCookie
    ? redirect(verificationPath, { headers: { 'Set-Cookie': result.setCookie } })
    : redirect(verificationPath)
}

export async function loader(_route: Route.LoaderArgs) {
  const [numberOfAdmin, authFeatures] = await Promise.all([
    countAdmin(),
    Promise.resolve(getPublicAuthFeatureConfig()),
  ])
  return {
    count: numberOfAdmin,
    authFeatures,
  }
}

export function meta() {
  return [
    { title: m.register_meta_title() },
    { name: 'description', content: m.register_meta_description() },
  ]
}

export default function Register({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<ActionResponse>()
  const registerSchema = createRegisterSchema()

  const [isLoading, setIsLoading] = useState(false)
  const [captchaResponse, setCaptchaResponse] = useState<string | null>(null)
  const recaptchaRef = useRef<RecaptchaV2Handle>(null)

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const submit = useSubmit()

  useEffect(() => {
    if (!actionData) return

    setIsLoading(false)
    recaptchaRef.current?.reset()
    toast.error(actionData.error)
  }, [actionData])

  const onSubmit = async (data: RegisterSchema) => {
    if (loaderData.authFeatures.recaptcha.enabled && !captchaResponse) {
      toast.error(m.auth_captcha_required())
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('password', data.password)
    if (captchaResponse) formData.append('captchaResponse', captchaResponse)

    submit(formData, {
      method: 'post',
    })
  }

  return (
    <AuthShell
      eyebrow={m.register_info_eyebrow()}
      infoTitle={m.register_info_title()}
      infoDescription={m.register_info_description()}
      highlights={[
        m.register_info_highlight_1(),
        m.register_info_highlight_2(),
        m.register_info_highlight_3(),
      ]}
    >
      <AuthCard
        title={m.register_title()}
        description={m.register_description()}
        footer={
          <div className="w-full space-y-3 text-center text-sm text-muted-foreground">
            <p>
              {m.register_have_account()}{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                {m.auth_sign_in()}
              </Link>
            </p>
            <Link to="/" className="inline-block font-medium text-primary hover:underline">
              {m.auth_back_to_home()}
            </Link>
          </div>
        }
      >
        <Form {...form}>
          <ReactRouterForm
            method="post"
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.register_name()}</FormLabel>
                  <FormControl>
                    <Input
                      className="h-11"
                      type="text"
                      placeholder={m.register_name_placeholder()}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.auth_email()}</FormLabel>
                  <FormControl>
                    <Input
                      className="h-11"
                      type="email"
                      placeholder={m.auth_email_placeholder()}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.auth_password()}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      className="h-11"
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.register_confirm_password()}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      className="h-11"
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {loaderData.authFeatures.recaptcha.enabled ? (
              <RecaptchaV2
                ref={recaptchaRef}
                siteKey={loaderData.authFeatures.recaptcha.siteKey}
                onChange={setCaptchaResponse}
                onLoadError={() => toast.error(m.auth_captcha_load_failed())}
                loadErrorMessage={m.auth_captcha_load_failed()}
                disabled={isLoading}
              />
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? m.register_submitting() : m.register_submit()}
            </Button>
          </ReactRouterForm>
        </Form>
      </AuthCard>
    </AuthShell>
  )
}
