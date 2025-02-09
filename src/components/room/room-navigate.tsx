import { useRoomContext } from '@/components/providers/room-provider'
import { Button } from '@/components/ui/button'
import { ArrowBigLeftDash, ArrowBigRightDash } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

type RoomNavigateProps = {
  navigate: (questionId: string) => Promise<void>
}

export function RoomNavigate({ navigate } : RoomNavigateProps) {

  const { t } = useTranslation('room')
  const canGoPrev = useRoomContext(state => state.canGoPrev)
  const canGoNext = useRoomContext(state => state.canGoNext)

  const [goToPrevQuestion, goToNextQuestion] = useRoomContext(
    useShallow((s) => [s.getPrevQuestionId, s.getNextQuestionId]),
  )

  async function navigateToPrev() {
    await navigate(goToPrevQuestion())
  }

  async function navigateToNext() {
    await navigate(goToNextQuestion())
  }

  return (
    <div className="inset-x-4 z-10 mb-6 flex justify-between sm:absolute">
      <form action={navigateToPrev}>
        <Button variant="outline" type="submit" disabled={!canGoPrev} >
          <ArrowBigLeftDash className="mr-2" /> {t('Prev')}
        </Button>
      </form>
      <form action={navigateToNext}>
        <Button variant="outline" type="submit" disabled={!canGoNext} >
          {t('Next')} <ArrowBigRightDash className="ml-2" />
        </Button>
      </form>
    </div>
  )
}


