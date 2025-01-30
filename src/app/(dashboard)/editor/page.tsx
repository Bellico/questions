import { createQuestionGroupAction } from '@/actions/editor/create-question-group-action'
import { QuestionsEditor } from '@/components/editor/questions-editor'

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ useDraft: boolean }>
}) {
  const { useDraft } = await searchParams
  return (
    <QuestionsEditor
      useDraft={useDraft}
      saveGroupAction={createQuestionGroupAction}
    />
  )
}
