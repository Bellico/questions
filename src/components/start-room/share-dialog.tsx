import { shareRoomAction } from '@/actions/room/share-room-action'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoomSettingsType } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Copy, Loader2, Share } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const ShareSchema = z.object({
  usermail: z.string().email()
}).refine(v => !!v.usermail)

type ShareSchemaType = z.infer<typeof ShareSchema>

export function ShareDialog( { settingValues } : { settingValues: () => RoomSettingsType}) {

  const { t } = useTranslation('room')
  const shareLinkRef = useRef<string>('')
  const [copied, setCopied] = useState(false)

  const form = useForm<ShareSchemaType>({
    resolver: zodResolver(ShareSchema)
  })

  const {
    handleSubmit,
    register,
    formState: { isSubmitting, isSubmitSuccessful, isValid },
  } = form

  const share = async ({ usermail }: ShareSchemaType) => {
    const shareValues = { usermail, ...settingValues() }
    const result = await shareRoomAction(shareValues)

    if (result.success) {
      shareLinkRef.current = result.data!
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary"><Share className="mr-2" />{t('ShareLink')}</Button>
      </DialogTrigger>
      <DialogContent>
        <form id="form-share" onSubmit={handleSubmit(share)}>

          <DialogHeader>
            <DialogTitle>{t('ShareQuestions')}</DialogTitle>
            <DialogDescription>
              {t('ShareQuestionsDesc')}
            </DialogDescription>
          </DialogHeader>

          {!isSubmitSuccessful &&
            <div className="flex items-center gap-4 py-4">
              <Label htmlFor="usermail">{(t('Usermail'))}:</Label>
              <Input
                id="usermail"
                type="email"
                inputMode="email"
                className="col-span-3"
                placeholder={(t('Usermail'))}
                {...register('usermail')}/>
            </div>
          }

          {isSubmitSuccessful &&
            <div className="flex items-center space-x-2 py-4">
              <div className="flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">Link</Label>
                <Input id="link" defaultValue={shareLinkRef.current} readOnly />
              </div>
              <Button size="sm" className="px-3" onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(shareLinkRef.current); setCopied(true)}}>
                <span className="sr-only">Copy</span>
                {copied ? <Check className="size-4 animate-wiggle" /> : <Copy className="size-4" />}
              </Button>
            </div>
          }

          {!isSubmitSuccessful &&
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || !isValid}>
                {isSubmitting && <Loader2 className="-ml-1 mr-3 animate-spin" />}
                {t('ShareLink')}
              </Button>
            </DialogFooter>
          }

        </form>
      </DialogContent>
    </Dialog>
  )
}
