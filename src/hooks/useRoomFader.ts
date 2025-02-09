import { answerRoomAction } from '@/actions/room/answer-room-action'
import { navigateRoomAction } from '@/actions/room/navigate-room-action'
import { useRoomContext } from '@/components/providers/room-provider'
import { RoomQuestionNextType } from '@/lib/schema'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useTransition } from 'react'
import { useShallow } from 'zustand/react/shallow'

export function useRoomFader(roomId: string, shareLink?: string) {

  const currentQuestion = useRoomContext(state => state.currentQuestion)
  const animation = useRoomContext(state => state.animation)
  const isEnd = useRoomContext(state => state.isEnd)

  const [disappears, disappearsWithResult, applyCorrection, appearsNewQuestion, showFinal] = useRoomContext(
    useShallow((s) => [s.disappears, s.disappearsWithResult, s.applyCorrection, s.appearsNewQuestion, s.showFinal]),
  )

  const router = useRouter()
  const nextQRef = useRef<RoomQuestionNextType | null>(null)
  const [isPending, startTransition] = useTransition()

  // To force refresh if we back and return on the page
  useEffect(()=> {
    return () => {
      router.refresh()
    }
  }, [router])

  // IsEnd so show final
  useEffect(()=> {
    if (!isEnd) return
    // When correction, don't show final automatically, the user will do it
    if (currentQuestion.navigate) return

    const time = setTimeout(() => {
      showFinal()
    }, 800)

    return () => {
      clearTimeout(time)
    }
  }, [showFinal, isEnd, currentQuestion])

  // Have next Question so appears it
  useEffect(()=> {
    if (!nextQRef.current) return

    const time = setTimeout(() => {
      appearsNewQuestion(nextQRef.current!)
    }, 750)

    return () => {
      clearTimeout(time)
    }
  }, [appearsNewQuestion, animation])

  // Valide choices and save next question then fadeOut
  async function submitChoices(choices: string[]) {
    startTransition(async () => {
      const result = await answerRoomAction({
        roomId: roomId,
        questionId: currentQuestion.questionId,
        choices,
        shareLink
      })

      if (!result.data) throw new Error('Answer Room failed')

      const isEnd = result.data.next == null
      nextQRef.current = result.data.next

      if (result.data.result.correction) {
        applyCorrection(result.data.result, choices, isEnd)
        return
      }

      disappearsWithResult(result.data.result, isEnd)
    })
  }

  async function navigate(questionId : string) {
    startTransition(async () => {
      const result = await navigateRoomAction({
        roomId: roomId,
        questionId: questionId,
        shareLink
      })

      if (result.data) {
        nextQRef.current = result.data
        disappears()
      }
    })
  }

  return {
    isPending,
    animation,
    submitChoices,
    navigate,
  }
}

