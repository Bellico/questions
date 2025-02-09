'use client'

import { updateUserSettingsAction } from '@/actions/users/update-user-settings-action'
import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { useAction } from '@/hooks/useAction'
import { UserSettingsSchema, UserSettingsType } from '@/lib/schema'
import { cn } from '@/lib/utils'
import { USER_DIALOG, useAppStore } from '@/stores/app-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import packageJson from '../../../package.json'
import { useShallow } from 'zustand/react/shallow'

export function UserSettings(data: UserSettingsType & { email: string}) {
  const router = useRouter()
  const { t } = useTranslation(['global', 'actions'])

  const [setDialogOpen, setDialogLoading] = useAppStore(
    useShallow((s) => [s.setDialogOpen, s.setDialogLoading])
  )

  const requestAction = useAction(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<UserSettingsType>({
    resolver: zodResolver(UserSettingsSchema),
    values: data,
    mode: 'onChange'
  })

  const { control, register, handleSubmit, getValues, setValue, formState: { isValid } } = form
  const { usePassword } = getValues()

  useEffect(() => {
    if (!usePassword) setValue('password', '')
  }, [setValue, usePassword])

  const updateUserSettings = async (data: UserSettingsType) => {
    setDialogLoading(true)
    requestAction(
      () => updateUserSettingsAction(data),
      () => {
        setDialogOpen(USER_DIALOG, false)
        router.refresh()
      },
      t('PreferencesUpdated', { ns: 'actions' })
    )
  }

  return (
    <Form {...form}>
      <form id="form-user-settings" onSubmit={handleSubmit(updateUserSettings)} noValidate className="grid items-start gap-6">

        <FormField
          control={form.control}
          name="username"
          render={() => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel>{t('Username')}</FormLabel>
              <FormControl>
                <Input placeholder={data.email} {...register('username')} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="usePassword"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <FormLabel>{t('UsePassword')}</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {usePassword &&
          <FormField
            control={form.control}
            name="password"
            render={() => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>{t('Password')}</FormLabel>
                <div className="flex items-center">
                  <FormControl>
                    <Input type={showPassword ? 'text' : 'password'} placeholder={data.usePassword ? '*******' : t('Password') } {...register('password')} />
                  </FormControl>
                  <Eye className={cn('absolute right-10', { 'hidden' : showPassword })} onClick={() => setShowPassword(!showPassword)} />
                  <EyeOff className={cn('absolute right-10', { 'hidden' : !showPassword })} onClick={() => setShowPassword(!showPassword)} />
                </div>
                <FormDescription>{t('UsePasswordDesc')}</FormDescription>
              </FormItem>
            )}
          />
        }

        <FormField
          control={control}
          name="locale"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">{t('Language')}</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-6">
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="fr" />
                      </FormControl>
                      <FormLabel className="font-normal">{t('French')}</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="en" />
                      </FormControl>
                      <FormLabel className="font-normal">{t('English')}</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-center text-xs">Version {packageJson.version}</p>

        <div className="flex flex-col md:flex-row md:justify-end">
          <DialogTrigger className="hidden md:block" asChild>
            <Button variant="ghost">{t('Cancel')}</Button>
          </DialogTrigger>
          <Button type="submit" disabled={!isValid}>{t('Save')}</Button>
        </div>
      </form>

    </Form>
  )
}
