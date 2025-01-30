'use client'

import { loginPasswordUserAction } from '@/actions/users/login-password-user-action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, MailCheck, MailWarning } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

const LoginSchema = z.object({
  password: z.string().min(8)
})

type LoginType = z.infer<typeof LoginSchema>

export default function LoginForm({ email } : { email : string} ) {
  const { t } = useTranslation('global')
  const [isSignByMail, setIsSignByMail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginType>({
    resolver: zodResolver(LoginSchema)
  })

  const {
    handleSubmit,
    register,
    setError,
    setFocus,
    formState: { isSubmitting, isValid, errors },
  } = form

  useEffect(() => {
    setFocus('password')
  }, [setFocus])

  const signWithPassword = async (data: LoginType) => {
    const result = await loginPasswordUserAction({ email: email, password: data.password })
    if (!result.success) {
      setError('root.invalidCredentials', { type: 'custom', message: t('InvalidCredentials') })
    }
  }

  const signWithEmail = async () => {
    const response = await signIn('forwardemail', { email: email, redirect: false })
    if (!response?.ok) {
      setError('root.serverError', { type: 'custom', message: t('SignInError') })
    }
    setIsSignByMail(true)
  }

  return (
    <>
      <form id="form-login" className="w-full max-w-sm space-y-4" onSubmit={handleSubmit(signWithPassword)}>

        <div className="relative flex items-center">
          <Input className="p-6" placeholder={t('EnterPassword')} type={showPassword ? 'text' : 'password'} autoComplete="on" {...register('password')} />
          <Eye className={cn('absolute text-second right-4', { 'hidden' : showPassword })} onClick={() => setShowPassword(!showPassword)} />
          <EyeOff className={cn('absolute text-second right-4', { 'hidden' : !showPassword })} onClick={() => setShowPassword(!showPassword)} />
        </div>

        <Button type="submit" className="w-full p-6" disabled={isSubmitting || !isValid}>
          {isSubmitting && <Loader2 className="-ml-1 mr-3 animate-spin" />}
          {t('SignIn')}
        </Button>
      </form>

      <form id="form-subscribe" className="w-full max-w-sm space-y-4" onSubmit={(e) => { e.preventDefault(); signWithEmail() }}>
        <Button type="submit" variant="link" className="text-sm text-foreground underline" disabled={isSignByMail}>
          {t('ForgotPassword')}
        </Button>
      </form>

      {isSignByMail &&
          <p className="animate-wiggle font-semibold text-green-700">
            <MailCheck className="mr-2 inline" />{t('SignInSuccess')}
          </p>
      }

      {errors.root?.serverError &&
          <p className="animate-wiggle font-semibold text-red-700">
            <MailWarning className="mr-2 inline" /> {errors.root?.serverError.message}
          </p>
      }

      {errors.root?.invalidCredentials &&
          <p className="animate-wiggle font-semibold text-red-700">{errors.root?.invalidCredentials.message}</p>
      }
    </>
  )
}
