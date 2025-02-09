'use server'

import { ActionResultType, withValidateAndSession } from '@/actions/wrapper-actions'
import prisma from '@/lib/prisma'
import { isGroupOwnerOrThrow } from '@/queries/actions-queries'
import { translate } from '@/queries/utils-queries'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import z from 'zod'

export const deleteQuestionGroupAction = withValidateAndSession(
  z.string(),
  async (id: string, userId: string): Promise<ActionResultType<void>> => {

    const { t } = await translate('actions')

    await isGroupOwnerOrThrow(id, userId)

    const isSharing = await prisma.groupsUsers.findFirst({
      where: {
        groupId: id,
      },
    })

    if (isSharing !== null) {
      return {
        success: false,
        message: t('SharedGroup'),
      }
    }

    try {
      await prisma.$transaction(async (tx) => {

        await tx.choices.deleteMany({
          where: {
            answer:{
              room:{
                groupId: id
              }
            }
          }
        })

        await tx.answer.deleteMany({
          where: {
            room:{
              groupId: id
            }
          }
        })

        await tx.room.deleteMany({
          where: {
            groupId: id
          }
        })

        await tx.questionGroup.delete({
          where: {
            id: id
          }
        })

      })

      revalidatePath('/board')

      return {
        success: true
      }
    }
    catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return {
          success: false,
          message: t('ErrorServer', { message: error.message })
        }
      }
      throw error
    }
  })
