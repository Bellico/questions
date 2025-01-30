import { AnswersList } from '@/components/board-group/answers-list'
import { RoomsList } from '@/components/board-group/rooms-list'
import { Spinner } from '@/components/commons/spinner'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { isGroupOwner } from '@/queries/commons-queries'
import { getGroupName } from '@/queries/pages-queries'
import { translate } from '@/queries/utils-queries'
import { Pencil, Play } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export default async function GroupBoardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { t } = await translate('global')
  const { id } = await params

  const session = await auth()
  const isOwner = await isGroupOwner(id, session!.user.id!)

  if(!isOwner){
    notFound()
  }

  return (
    <div className="bg-accent">

      <section>
        <div className="container">
          <h1 className="title">{await getGroupName(id)}</h1>

          <div className="my-12 flex justify-center">
            <Link href={`/start/${id}`}>
              <Button className="mr-2" size="lg"><Play className="mr-2 size-4" />{t('Start')}</Button>
            </Link>

            <Link href={`/editor/${id}`}>
              <Button variant="secondary" size="lg"><Pencil className="mr-2 size-4" />{t('Edit')}</Button>
            </Link>
          </div>

          <Suspense fallback={<Spinner />}>
            <RoomsList userId={session?.user.id!} groupId={id} mode='Rating' />
          </Suspense>

        </div>
      </section>

      <section>
        <div className="container">
          <Suspense fallback={<Spinner />}>
            <AnswersList userId={session?.user.id!} groupId={id} />
          </Suspense>
        </div>
      </section>

    </div>
  )
}
