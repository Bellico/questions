import { startShareRoomAction } from '@/actions/room/start-share-room-action'
import { Button } from '@/components/ui/button'
import { getGroupForShareQuery } from '@/queries/pages-queries'
import { translate } from '@/queries/utils-queries'
import { redirect } from 'next/navigation'

export default async function StartPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ shareLink?: string }>
}) {
  const { id } = await params
  const { shareLink } = await searchParams

  if(!shareLink){
    redirect('/')
  }

  const room = await getGroupForShareQuery(id, shareLink)
  if (!room) {
    redirect('/')
  }

  if (room.dateStart) {
    redirect(`/room/${id}/?shareLink=${shareLink}`)
  }

  const { t } = await translate('room')

  async function startShareRoom(){
    'use server'
    const result = await startShareRoomAction({
      roomId: id,
      shareLink: shareLink
    })

    if(result.success){
      redirect(`/room/${id}/?shareLink=${shareLink}`)
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center gap-8 px-4 text-center">
      <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl">
        {t('SharePageTitle')}
      </h1>

      <p className="text-gray-500 dark:text-gray-400">
        {t('SharePageDesc', { questionCount: room.group._count.questions })}
      </p>

      <div className="w-full max-w-sm">
        <form action={startShareRoom} >
          <Button className="w-full">
            {t('StartAnswer')}
          </Button>
        </form>
      </div>
    </section>
  )
}
