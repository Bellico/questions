import { Room } from '@/components/room/room'
import { auth } from '@/lib/auth'
import { canPlayRoomQuery, getNextQuestionToAnswerQuery } from '@/queries/commons-queries'
import { getProgressInfosRoomQuery, getProgressInfosWithRandomQuery } from '@/queries/pages-queries'
import { notFound, redirect } from 'next/navigation'

export default async function RoomPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ shareLink?: string }>
}) {
  const session = await auth()
  const { id } = await params
  const { shareLink } = await searchParams

  const room = await canPlayRoomQuery(id, session?.user.id, shareLink)
  if (!room) {
    notFound()
  }

  const nextQuestion = await getNextQuestionToAnswerQuery(room.id)
  if (!nextQuestion) {
    redirect('/')
  }

  const progress = room.withRandom ?
    await getProgressInfosWithRandomQuery(room.id, room.groupId!, room.withProgressState):
    await getProgressInfosRoomQuery(room.id, room.groupId!, room.withProgressState)

  return (
    <Room
      roomId={room.id}
      currentQuestion={nextQuestion}
      progress={progress}
      withNavigate={room.withNavigate}
      withProgress={room.withProgress}
      shareLink={shareLink} />
  )
}
