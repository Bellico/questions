import { RoomFinalResumeSection } from '@/components/final/room-final-resume-section'
import { getRoomFinalResumeQuery } from '@/queries/pages-queries'

export async function RoomFinalResume({ roomId } : { roomId: string}) {
  const resume = await getRoomFinalResumeQuery(roomId)
  return (
    <>
      { resume.map(answer => <RoomFinalResumeSection key={answer.id} answerResume={answer} />)}
    </>
  )
}
