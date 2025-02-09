'use client'

import { deleteQuestionGroupAction } from '@/actions/editor/delete-question-group-action'
import { duplicateQuestionGroupAction } from '@/actions/editor/duplicate-question-group-action'
import { abortRoomAction } from '@/actions/room/abort-room-action'
import { DrawerDialog } from '@/components/commons/drawer-dialog'
import { YesNoDialog } from '@/components/commons/yes-no-dialog'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { GroupsUsersSharing } from '@/components/users/groups-users-sharing'
import { useAction } from '@/hooks/useAction'
import { downloadBlob } from '@/lib/utils'
import { SHARE_DIALOG } from '@/stores/app-store'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

type QuestionsTableProps = {
  groupId: string,
  roomInProgress: boolean
}

export function QuestionGroupsListActions({ groupId, roomInProgress }: QuestionsTableProps) {
  const dropDownRef = useRef<HTMLDivElement>(null)
  const requestAction = useAction()
  const { t } = useTranslation(['global', 'actions'])

  async function onAbortAction() {
    requestAction(
      () => abortRoomAction(groupId),
      () => {},
      t('Aborted', { ns: 'actions' })
    )
  }

  async function onDeleteAction() {
    requestAction(
      () => deleteQuestionGroupAction(groupId),
      () => {},
      t('GroupDeleted', { ns: 'actions' })
    )
  }

  async function onDuplicateAction() {
    requestAction(
      () => duplicateQuestionGroupAction(groupId),
      () => {},
      t('GroupDuplicated', { ns: 'actions' })
    )
  }

  async function onExportAction() {
    const res = await fetch(`/api/export?id=${groupId}`)
    await downloadBlob(res)
  }

  function closeDropDownHack(e) {
    e.preventDefault(); dropDownRef.current?.remove()
  }

  return (
    <DropdownMenuContent ref={dropDownRef} align="end">
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuSeparator />

      {roomInProgress &&
        <YesNoDialog action={onAbortAction} titleDialog={t('YesNoTitle')} descDialog={t('YesNoAbort')}>
          <DropdownMenuItem className="text-destructive" onSelect={closeDropDownHack}>
            {t('Abort')}
          </DropdownMenuItem>
        </YesNoDialog>
      }

      <DrawerDialog
        dialogId={SHARE_DIALOG}
        title={t('UserGroupsSharing')}
        description={t('UserGroupsSharingDesc')}
        trigger={
          <DropdownMenuItem onSelect={closeDropDownHack}>
            {t('Share')}
          </DropdownMenuItem>}>
        <GroupsUsersSharing groupId={groupId} />
      </DrawerDialog>

      <DropdownMenuItem onClick={() => onExportAction()}>{
        t('Export')}
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => onDuplicateAction()}>
        {t('Duplicate')}
      </DropdownMenuItem>

      <YesNoDialog action={onDeleteAction} titleDialog={t('YesNoTitle')} descDialog={t('YesNoDeleteGroup')}>
        <DropdownMenuItem onSelect={closeDropDownHack}>
          {t('Delete')}
        </DropdownMenuItem>
      </YesNoDialog>
    </DropdownMenuContent>
  )
}
