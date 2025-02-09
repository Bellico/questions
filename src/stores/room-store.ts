import { RoomProgressType, RoomQuestionNextType, RoomQuestionResultType } from '@/lib/schema'
import { create } from 'zustand'

export type RoomStateProps = {
    currentQuestion: RoomQuestionNextType,
    progress : RoomProgressType[]
}

type animationType = 'animate-scale-up' | 'animate-zoom-in-room' | 'animate-zoom-out-room'

export type RoomState = RoomStateProps & {
  animation: animationType,
  progressingId?: string
  isCompleted: boolean,
  isEnd: boolean
  isAutoSubmit: boolean,
  canGoPrev: boolean,
  canGoNext: boolean,
  showFinal: () => void,
  setAutoSubmit: (isAutoSubmit : boolean) => void,
  disappears: () => void,
  appearsNewQuestion: (question: RoomQuestionNextType) => void,
  disappearsWithResult: (result : RoomQuestionResultType, isEnd: boolean) => void,
  applyCorrection: (result : RoomQuestionResultType, choices: string[], isEnd: boolean) => void,
  getPrevQuestionId: () => string
  getNextQuestionId: () => string
}

export const createRoomStore = (initProps: RoomStateProps) => {
  const DEFAULT_PROPS = {
    animation: 'animate-scale-up' as animationType,
    isCompleted : false,
    isEnd: false,
    isAutoSubmit: false,
    canGoPrev: initProps.currentQuestion.questionId !== initProps.progress[0].id,
    canGoNext: false
  }

  return create<RoomState>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,

    showFinal: () => set(() => ({ isCompleted : true })),

    setAutoSubmit: (isAutoSubmit : boolean) => set(() => ({ isAutoSubmit  })),

    disappears: () => set((state) => ({ animation : 'animate-zoom-out-room', isCompleted: state.isEnd })),

    appearsNewQuestion: (question: RoomQuestionNextType) => set((state) => {
      const newProgress = [...state.progress]

      const canGoPrev = question.questionId !== initProps.progress[0].id
      const canGoNext = !!question.navigate

      // Random case -> find next empty slot to fill Id
      if (newProgress.findIndex(p => p.id == question.questionId) < 0) {
        const index = newProgress.findIndex(p => !p.id)
        newProgress[index].id = question.questionId

        return { currentQuestion: question, animation : 'animate-zoom-in-room', progress: newProgress, canGoPrev, canGoNext }
      }

      return { currentQuestion: question, animation : 'animate-zoom-in-room', canGoPrev, canGoNext }
    }),

    disappearsWithResult: (result : RoomQuestionResultType, isEnd: boolean) => set((state) => {
      const newProgress = [...state.progress]
      const index = newProgress.findIndex(p => p.id == result.id)
      newProgress[index].hasGood = result.hasGood
      newProgress[index].title = result.title
      newProgress[index].isAnswer = true

      return { animation : 'animate-zoom-out-room', progress: newProgress, progressingId: result.id!, isEnd }
    }),

    applyCorrection: (result : RoomQuestionResultType, choices: string[], isEnd: boolean) => set((state) => {
      const newProgress = [...state.progress]
      const index = newProgress.findIndex(p => p.id == result.id)
      newProgress[index].hasGood = result.hasGood
      newProgress[index].title = result.title
      newProgress[index].isAnswer = true

      const newCurrentQuestion = { ...state.currentQuestion, navigate :{
        hasGood: result.hasGood!,
        correction: result.correction!,
        choices: choices
      } }

      return { currentQuestion: newCurrentQuestion, progress: newProgress, progressingId: result.id!, isEnd }
    }),

    getPrevQuestionId: () => {
      const currentId = get().currentQuestion.questionId
      const progress = get().progress
      const currentIndex = get().progress.findIndex(p => p.id == currentId || !p.id)

      return progress[currentIndex- 1].id!
    },

    getNextQuestionId: () => {
      const currentId = get().currentQuestion.questionId
      const progress = get().progress
      const currentIndex = progress.findIndex(p => p.id == currentId)
      const next = progress[currentIndex + 1]

      return next.id!
    }

  }))
}
