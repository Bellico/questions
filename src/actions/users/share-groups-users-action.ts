'use server'

import { ActionResultType, withValidateAndSession } from '@/actions/wrapper-actions'
import prisma from '@/lib/prisma'
import { GroupUsersSchema, GroupUsersType } from '@/lib/schema'
import { isGroupOwnerOrThrow } from '@/queries/actions-queries'
import { revalidatePath } from 'next/cache'

export const shareGroupsUsersAction = withValidateAndSession(
  GroupUsersSchema,
  async (data: GroupUsersType, userId: string): Promise<ActionResultType<void>> => {

    await isGroupOwnerOrThrow(data.groupId, userId)

    await prisma.$transaction(async (tx) => {

      await tx.groupsUsers.deleteMany({
        where: {
          groupId: data.groupId
        }
      })

      const groupsUsers = data.userIdsToShared.map(d => ({ groupId: data.groupId, userId: d }))
      await tx.groupsUsers.createMany({
        data: groupsUsers
      })
    })

    revalidatePath('/board')

    return {
      success: true
    }
  })
