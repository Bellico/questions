import { ActionResultType } from '@/actions/wrapper-actions'
import { useQuestionsEditorContext, useQuestionsEditorPersist } from '@/components/providers/questions-editor-provider'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useAction } from '@/hooks/useAction'
import { QuestionGroupType } from '@/lib/schema'
import { mapToArray } from '@/lib/utils'
import { ArrowBigLeft, ArrowDownToLine } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

type QuestionsEditorActionsProps = {
    saveGroupAction: (values: QuestionGroupType) => Promise<ActionResultType<string | void>>;
    useDraft?: boolean
}

export function QuestionsEditorActions({ useDraft, saveGroupAction }: QuestionsEditorActionsProps) {

  const { t } = useTranslation(['global', 'actions'])
  const router = useRouter()
  const requestAction = useAction()
  const [open, setDialogOpen] = useState(false)
  const persist = useQuestionsEditorPersist()

  const [groupId, groupName, questionsMap] = useQuestionsEditorContext(
    useShallow((s) => [s.id, s.name, s.questionsMap]),
  )

  // Rehydrate draft from storage
  useEffect(() => {
    if (useDraft) persist?.rehydrate()
  }, [persist, useDraft])

  async function onSubmitEditor() {
    const questionsToSave = mapToArray(questionsMap).filter(q => !!q.subject)

    requestAction(
      () => saveGroupAction({
        id: groupId,
        name: groupName,
        questions: questionsToSave
      }),
      () => {
        persist?.clearStorage()
        router.back()
      },
      !groupId ? t('GroupCreated', { ns: 'actions' }) : t('GroupUpdated', { ns: 'actions' })
    )
  }

  function onBack() {
    const persistName = persist?.getOptions().name
    if (persistName && localStorage.getItem(persistName)) {
      setDialogOpen(true)
      return
    }
    persist?.clearStorage()
    router.back()
  }

  function onBackConfirm() {
    persist?.clearStorage()
    router.back()
  }

  return (
    <>
      <div className="my-12 flex justify-center">
        <form id="form-save-editor" action={onSubmitEditor}>
          <Button className="mr-2" size="lg"><ArrowDownToLine className="mr-2 size-4" />{t('Save')}</Button>
        </form>

        <form id="form-back-editor" action={onBack}>
          <Button variant="secondary" size="lg"><ArrowBigLeft className="mr-2 size-4" />{t('Back')}</Button>
        </form>
      </div>

      <AlertDialog open={open} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('ChangesNotSaved')}</AlertDialogTitle>
            <AlertDialogDescription>{t('KeepDraftDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onBackConfirm}>{t('DeleteDraft')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.back()}>{t('SaveDraft')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
