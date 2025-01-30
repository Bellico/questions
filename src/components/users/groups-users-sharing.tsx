'use client'

import { shareGroupsUsersAction } from '@/actions/users/share-groups-users-action'
import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAction } from '@/hooks/useAction'
import { SHARE_DIALOG, useAppStore } from '@/stores/app-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useShallow } from 'zustand/react/shallow'

type GroupsUsersSharingProps = {
  groupId: string
}

const ShareFormSchema = z.object({
  users: z.array(z.object({
    userId: z.string(),
    isShared: z.boolean()
  })),
})

type ShareFormType = z.infer<typeof ShareFormSchema>

export function GroupsUsersSharing({ groupId } : GroupsUsersSharingProps) {
  const { t } = useTranslation(['global', 'actions'])
  const requestAction = useAction(false)

  const [setDialogOpen, setDialogLoading] = useAppStore(
    useShallow((s) => [s.setDialogOpen, s.setDialogLoading])
  )

  const [allUsers, setAllUsers] = useState<{ id: string, name: string | null, email: string }[]>([])

  const form = useForm<ShareFormType>({
    resolver: zodResolver(ShareFormSchema),
  })

  const {control, handleSubmit } = form
  const { fields: usersField, append } = useFieldArray({
    control,
    name: 'users',
  })

  useEffect(() =>{
    const fetchData = async () => {
      setDialogLoading(true)
      const response = await fetch(`/api/groups-users?id=${groupId}`)
      const json = await response.json()

      form.setValue('users', json.sharedUsers.map(userId => ({ userId, isShared: true})))
      setAllUsers(json.users)
      setDialogLoading(false)
    }

    fetchData()
  }, [groupId, setDialogLoading, form])

  const updateSharing = async (data: ShareFormType) => {
    setDialogLoading(true)

    requestAction(
      () => shareGroupsUsersAction({
        groupId,
        userIdsToShared: data.users.filter(u => u.isShared).map(u => u.userId)
      }),
      () => {
        setDialogOpen(SHARE_DIALOG, false)
      },
      t('GroupsUsersShared', { ns: 'actions'})
    )
  }

  function getUserTemplate(userId: string){
    const user = allUsers.find(u => u.id === userId)
    if(!user) return 'invalid'

    return(
      <label htmlFor={userId} className="text-sm">
        {user.name && <h3 className="">{user.name}</h3>}
        <span className="text-gray-500">{user.email}</span>
      </label>
    )
  }

  return (
    <Form {...form}>
      <form id="form-users-groups" onSubmit={handleSubmit(updateSharing)}>
        <div className="mb-4 space-y-4 p-4">

          {usersField.map((user, index) => (
            <div key={user.userId} className="flex items-center justify-between">
              {getUserTemplate(user.userId)}
              <div>
                <FormField
                  control={control}
                  name={`users.${index}.isShared`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch id={user.userId} checked={field.value} onCheckedChange={field.onChange} name="isShared" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          <Select
            value=""
            onValueChange={(value) => {
              append({ userId: value, isShared: true })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('AddUser')} />
            </SelectTrigger>
            <SelectContent side="bottom">
              {allUsers.filter(u => !usersField.map(u => u.userId).includes(u.id)).map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name ?? user.email} {user.name ? `(${user.email})`: ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row md:justify-end">
          <DialogTrigger className="hidden md:block" asChild>
            <Button variant="ghost">{t('Cancel')}</Button>
          </DialogTrigger>
          <Button type="submit">{t('Save')}</Button>
        </div>
      </form>
    </Form>
  )
}
