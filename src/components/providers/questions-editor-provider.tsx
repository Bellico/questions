import { QuestionGroupType } from '@/lib/schema'
import { arrayToMap } from '@/lib/utils'
import { QuestionsEditorState, QuestionsEditorStateProps, createQuestionsEditorStore } from '@/stores/questions-editor-store'
import { PropsWithChildren, createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand'

type QuestionsEditorStore = ReturnType<typeof createQuestionsEditorStore>

const QuestionsEditorContext = createContext<QuestionsEditorStore | null>(null)

export function useQuestionsEditorContext<T>(selector: (state: QuestionsEditorState) => T): T {
  const store = useContext(QuestionsEditorContext)

  if (!store) throw new Error('Missing Provider in the tree')

  return useStore(store, selector)
}

export function useQuestionsEditorPersist() {
  return useContext(QuestionsEditorContext)?.persist
}

export function QuestionsEditorProvider({ value, children }: PropsWithChildren<{ value?: QuestionGroupType }>) {
  const storeRef = useRef<QuestionsEditorStore>(null)
  let storeValue: QuestionsEditorStateProps | undefined = undefined

  if (value) {
    storeValue = {
      ...value,
      questionsMap: arrayToMap(value.questions)
    }
  }

  if (!storeRef.current) {
    storeRef.current = createQuestionsEditorStore(storeValue)
  }

  return (
    <QuestionsEditorContext.Provider value={storeRef.current}>
      {children}
    </QuestionsEditorContext.Provider>
  )
}
