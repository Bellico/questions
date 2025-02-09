'use client'

import { deleteRoomAction } from '@/actions/room/delete-room-action'
import { retryRoomAction } from '@/actions/room/retry-room-action'
import { RoomsTableColumns } from '@/components/board-group/rooms-table-columns'
import { DataTable } from '@/components/commons/data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAction } from '@/hooks/useAction'
import { useDataTable } from '@/hooks/useDataTable'
import { ArrayType } from '@/lib/utils'
import { getRoomBoardQuery } from '@/queries/pages-queries'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type dataTableType = ArrayType<Awaited<ReturnType<typeof getRoomBoardQuery>>>

export function RoomsTable({ userId, roomsList } : { userId: string, roomsList: dataTableType[]} ) {

  const { t } = useTranslation('global')
  const requestAction = useAction()

  const columns = RoomsTableColumns(userId, onRetryAction, onDeleteAction, t)
  const table = useDataTable(roomsList, columns)
  const userSelect = [...new Set(roomsList.map(r => r.user.email!))].sort()
  const userMap = new Map(roomsList.map(item => [item.user.email, { email:  item.user.email!, name: item.user.name }]))

  // Query list sort by dateStart asc for chart => make a sort desc for table
  useEffect(() => {
    const dateColumn = table.getColumn('dateStart')
    dateColumn?.toggleSorting(true)
  },[table])

  async function onRetryAction(roomId: string) {
    requestAction(
      () => retryRoomAction({ roomId }),
      () => { redirect(`/room/${roomId}`) },
    )
  }

  async function onDeleteAction(roomId: string) {
    requestAction(
      () => deleteRoomAction(roomId),
      () => { },
    )
  }

  return (
    <div className="space-y-4">

      {userSelect.length > 1 &&
        <Select
          value={(table.getColumn('who')?.getFilterValue() as string) ?? ''}
          onValueChange={(value) => {
            table.getColumn('who')?.setFilterValue(value == 'all' ? '' : value)
          }}
        >
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder={t('FilterUsers')} />
          </SelectTrigger>
          <SelectContent side="bottom">
            <SelectItem value='all'>{t('AllUsers')}</SelectItem>
            {userSelect.map((email) => (
              <SelectItem key={email} value={email}>{userMap.get(email)?.name ?? email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      }

      <DataTable table={table} />
    </div>
  )
}
