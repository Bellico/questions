import { RoomSettings } from '@/components/start-room/room-settings'
import { auth } from '@/lib/auth'
import { canAccessGroup, getGroupInProgressQuery } from '@/queries/commons-queries'
import { getGroupForStartQuery, getLastSettingsRoomQuery } from '@/queries/pages-queries'
import { notFound, redirect } from 'next/navigation'

export default async function StartPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id } = await params

  if (!session) {
    redirect('/')
  }

  const canAccess = await canAccessGroup(id, session.user.id!)
  if (!canAccess.canAccess) {
    notFound()
  }

  const group = await getGroupForStartQuery(id)
  const activeRooms = await getGroupInProgressQuery([group.id], session.user.id!)
  if(activeRooms.length > 0){
    redirect(`/room/${activeRooms[0].id}`)
  }

  const lastSettings = await getLastSettingsRoomQuery(group.id, session.user.id!)
  if(!canAccess.isAuthor){
    lastSettings.mode = 'Rating'
  }

  return (
    <section className="animate-move-to-left">
      <div className="container">

        <h1 className="title">
          {group.name}
        </h1>

        <p className="text-second mb-6 text-center text-3xl font-bold lg:mb-12">
          {group._count.questions} questions
        </p>

        <RoomSettings {...lastSettings} isAuthor={canAccess.isAuthor} />
      </div>
    </section>
  )
}
