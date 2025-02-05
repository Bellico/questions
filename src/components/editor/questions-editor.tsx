'use client'

import { ActionResultType } from '@/actions/wrapper-actions'
import { QuestionsEditorAccordion } from '@/components/editor/questions-editor-accordion'
import { QuestionsEditorActions } from '@/components/editor/questions-editor-actions'
import { QuestionsEditorHeader } from '@/components/editor/questions-editor-header'
import { QuestionsEditorProvider } from '@/components/providers/questions-editor-provider'
import { QuestionGroupType } from '@/lib/schema'

type QuestionsEditorProps = {
  questionGroup?: QuestionGroupType,
  useDraft?: boolean,
  saveGroupAction: (values: QuestionGroupType) => Promise<ActionResultType<string | void>>;
}

export function QuestionsEditor(props: QuestionsEditorProps) {
  return (
    <div className="animate-zoom-in-editor">
      <QuestionsEditorProvider value={props.questionGroup}>
        <div className="container">
          <QuestionsEditorActions {...props} />
          <QuestionsEditorHeader />
        </div>

        <QuestionsEditorAccordion />

      </QuestionsEditorProvider>
    </div>
  )
}
