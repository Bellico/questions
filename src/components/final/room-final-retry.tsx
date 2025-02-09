import { retryRoomAction } from '@/actions/room/retry-room-action'
import { Button } from '@/components/ui/button'
import { translate } from '@/queries/utils-queries'
import { ListRestart } from 'lucide-react'
import { redirect } from 'next/navigation'

export async function RoomFinalRetry({ roomId, shareLink } : { roomId: string, shareLink?: string}) {

  const { t } = await translate('global')

  const retryRoom = async () => {
    'use server'
    const result = await retryRoomAction({
      roomId,
      shareLink,
    })

    if (result.success) {
      if (shareLink)
        redirect(`/room/${roomId}/?shareLink=${shareLink}`)
      else
        redirect(`/room/${roomId}`)
    }
  }

  return (
    <form action={retryRoom}>
      <Button className="mr-4 sm:w-36">
        <ListRestart className="mr-2" />
        {t('Retry')}
      </Button>
    </form>
  )
}
