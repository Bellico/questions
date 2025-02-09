import { Spinner } from '@/components/commons/spinner'
import { RoomFinalHero } from '@/components/final/room-final-hero'
import { RoomFinalHeroStats } from '@/components/final/room-final-hero-stats'
import { RoomFinalResume } from '@/components/final/room-final-resume'
import { auth } from '@/lib/auth'
import { canViewFinalRoomQuery } from '@/queries/pages-queries'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import '../../../confetti.css'

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

  const room = await canViewFinalRoomQuery(id, session?.user.id, shareLink)

  if (!room) {
    redirect('/')
  }

  const hero = {
    canScroll: room.withResults,
    canRetry: (room.withRetry || 0) > 0,
    playConfetti: room.withResults && room.score === 100,
    roomId: room.id,
    shareLink: shareLink
  }

  if (!room.withResults) {
    return (
      <RoomFinalHero {...hero} />
    )
  }

  return (
    <>
      <RoomFinalHero {...hero} >
        <Suspense fallback={<Spinner />}>
          <RoomFinalHeroStats roomId={room.id} />
        </Suspense>
      </RoomFinalHero>

      <Suspense fallback={<Spinner />}>
        <RoomFinalResume roomId={room.id} />
      </Suspense>
    </>
  )
}
