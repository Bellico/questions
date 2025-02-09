import { Spinner } from '@/components/commons/spinner'
import { RoomFinalResume } from '@/components/final/room-final-resume'
import { RoomFinalSummary } from '@/components/final/room-final-summary'
import { auth } from '@/lib/auth'
import { isRoomOwner } from '@/queries/actions-queries'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export default async function ResultsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  const isOwner = await isRoomOwner(params.id, session!.user.id!)

  if (!isOwner) {
    notFound()
  }

  return (
    <>
      <RoomFinalSummary roomId={params.id} canRetry={false} />
      <Suspense fallback={<Spinner />} >
        <RoomFinalResume roomId={params.id} />
      </Suspense>
    </>
  )
}
