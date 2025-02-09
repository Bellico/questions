import { Spinner } from '@/components/commons/spinner'
import { useRoomContext } from '@/components/providers/room-provider'
import { RoomCorrection } from '@/components/room/room-correction'
import { RoomNavigate } from '@/components/room/room-navigate'
import { RoomProgress } from '@/components/room/room-progress'
import { RoomResponses } from '@/components/room/room-responses'
import { RoomSubject } from '@/components/room/room-subject'
import { useRoomFader } from '@/hooks/useRoomFader'
import { redirect } from 'next/navigation'

type RoomDisplayProps = {
  roomId: string,
  withProgress: boolean
  withNavigate: boolean
  shareLink?: string
}

export function RoomDisplay({ roomId, withProgress, withNavigate, shareLink } : RoomDisplayProps) {
  const currentQuestion = useRoomContext(state => state.currentQuestion)
  const isCompleted = useRoomContext(state => state.isCompleted)
  const disappears = useRoomContext(state => state.disappears)

  const { isPending, animation, submitChoices, navigate } = useRoomFader(roomId, shareLink)

  if (isCompleted) {
    if (shareLink)
      redirect(`/final/${roomId}/?shareLink=${shareLink}`)
    else
      redirect(`/final/${roomId}`)
  }

  return (
    <section className="relative min-h-[calc(100vh-65px)] w-full lg:py-24">
      <div className="container relative mb-12">

        {withNavigate && <RoomNavigate navigate={navigate} />}

        <div className={animation}>
          <RoomSubject />
          {!currentQuestion.navigate ?
            <RoomResponses submitAnswerChoices={submitChoices} /> :
            <RoomCorrection goToNext={disappears} />
          }
          {isPending && <Spinner className="mt-8" />}
        </div>

      </div>
      {withProgress && <RoomProgress withNavigate={withNavigate} navigate={navigate} />}
    </section>
  )
}


