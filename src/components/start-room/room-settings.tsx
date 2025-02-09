'use client'

import { startRoomAction } from '@/actions/room/start-room-action'
import { ShareDialog } from '@/components/start-room/share-dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { useAction } from '@/hooks/useAction'
import { RoomSettingsSchema, RoomSettingsType } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { RoomMode } from '@prisma/client'
import { Play } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export function RoomSettings(settings: RoomSettingsType & { isAuthor: boolean}) {
  const form = useForm<RoomSettingsType>({
    resolver: zodResolver(RoomSettingsSchema),
    values: settings,
    mode: 'onChange'
  })

  const { control, getValues, setValue, clearErrors } = form
  const { mode, withProgress,  withCorrection } = getValues()

  const { t } = useTranslation('room')
  const requestAction = useAction()

  useEffect(() => {
    // Correction is only in Training
    if (mode === RoomMode.Rating && withCorrection) setValue('withCorrection', false)

    // Result in progress bar needs progressbar
    if (!withProgress) setValue('withProgressState', false)

    // Correction means result in progress bar by default
    if (withCorrection && withProgress) setValue('withProgressState', true)

    // Retries only in Rating
    if (mode === RoomMode.Training) {
      setValue('withRetry', 0)
      clearErrors('withRetry')
    }
  }, [setValue, clearErrors, mode, withCorrection, withProgress])

  async function start() {
    requestAction(
      () => startRoomAction(getValues()),
      (data) => redirect(`/room/${data}`),
    )
  }

  return (
    <Form {...form}>
      <form id="form-room-settings" className="m-auto space-y-6 lg:w-2/3">

        <FormField
          control={control}
          name="mode"
          render={({ field }) => (
            <FormItem className="rounded-lg border bg-background p-4">
              <FormLabel className="text-base">{t('WithMode')}</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-6">
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Training" disabled={!settings.isAuthor} />
                      </FormControl>
                      <FormLabel className="font-normal">{t('Training')}</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Rating" />
                      </FormControl>
                      <FormLabel className="font-normal">{t('Rating')}</FormLabel>
                    </FormItem>
                  </RadioGroup>
                  <FormDescription>
                    {t('TrainingDesc')}<br />
                    {t('RatingDesc')}
                  </FormDescription>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === RoomMode.Training &&
          <FormField
            control={form.control}
            name="withCorrection"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{t('WithCorrection')}</FormLabel>
                  <FormDescription>{t('WithCorrectionDesc')}</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        }

        {mode === RoomMode.Rating &&
          <FormField
            control={form.control}
            name="withRetry"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{t('WithRetry')}</FormLabel>
                  <FormDescription>{t('WithRetryDesc')}</FormDescription>
                  <FormMessage />
                </div>
                <FormControl>
                  <Input className="w-16" type="number" inputMode="numeric" {...field} value={field.value || 0} min="0" max="3" />
                </FormControl>
              </FormItem>
            )}
          />
        }

        <FormField
          control={form.control}
          name="withNavigate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t('withNavigate')}</FormLabel>
                <FormDescription>{t('withNavigateDesc')}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="withRandom"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t('WithRandom')}</FormLabel>
                <FormDescription>{t('WithRandomDesc')}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="withProgress"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t('WithProgress')}</FormLabel>
                <FormDescription>{t('WithProgressDesc')}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {withProgress &&
          <FormField
            control={form.control}
            name="withProgressState"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{t('WithProgressState')}</FormLabel>
                  <FormDescription>{t('WithProgressStateDesc')}</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        }

        <FormField
          control={form.control}
          name="withResults"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t('WithResults')}</FormLabel>
                <FormDescription>{t('WithResultsDesc')}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid items-center justify-center gap-4 text-center sm:flex">
          <Button onClick={(e) => { e.preventDefault(); start()}}><Play className="mr-2" />{t('Start')}</Button>
          {settings.isAuthor && <ShareDialog settingValues={getValues} />}
        </div>
      </form>
    </Form>
  )
}
