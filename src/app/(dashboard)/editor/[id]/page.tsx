import { updateQuestionGroupAction } from '@/actions/editor/update-question-group-actions'
import { QuestionsEditor } from '@/components/editor/questions-editor'
import { auth } from '@/lib/auth'
import { getEditorQuery } from '@/queries/pages-queries'
import { notFound } from 'next/navigation'

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ useDraft: boolean }>
}) {
  const session = await auth()
  const { id } = await params
  const { useDraft } = await searchParams

  const questionGroup = await getEditorQuery(id, session?.user.id!)

  if (!questionGroup) {
    notFound()
  }

  return (
    <QuestionsEditor
      useDraft={useDraft}
      questionGroup={questionGroup}
      saveGroupAction={updateQuestionGroupAction}
    />
  )
}
