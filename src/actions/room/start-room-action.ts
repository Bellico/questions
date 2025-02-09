'use server'

import { ActionResultType, withValidateAndSession } from '@/actions/wrapper-actions'
import prisma from '@/lib/prisma'
import { RoomSettingsSchema, RoomSettingsType } from '@/lib/schema'
import { computeNextQuestionQuery } from '@/queries/actions-queries'
import { canAccessGroup, getGroupInProgressQuery } from '@/queries/commons-queries'
import { translate } from '@/queries/utils-queries'
import { Prisma } from '@prisma/client'

export const startRoomAction = withValidateAndSession(
  RoomSettingsSchema,
  async (data: RoomSettingsType, userId: string): Promise<ActionResultType<string>> => {

    const { t } = await translate('actions')

    const canAccess = await canAccessGroup(data.groupId, userId)
    if (!canAccess.canAccess) {
      throw new Error('401 Unauthorized')
    }

    const activeRooms = await getGroupInProgressQuery([data.groupId], userId)
    if (activeRooms.length > 0) {
      throw new Error('403 Forbidden')
    }

    if (!canAccess.isAuthor && data.mode === 'Training') {
      throw new Error('401 Unauthorized')
    }

    const nextQuestionId = await computeNextQuestionQuery(data.groupId, data.withRandom, [])
    const dateStart = new Date()

    try {
      const roomId = await prisma.$transaction(async (tx) => {
        const room = await tx.room.create({
          data: {
            groupId: data.groupId,
            dateStart,
            userId: userId,
            mode: data.mode,
            withRetry: data.withRetry > 0 ? Number(data.withRetry) : null,
            withResults: data.withResults,
            withCorrection: data.withCorrection,
            withRandom: data.withRandom,
            withProgress: data.withProgress,
            withProgressState: data.withProgress && data.withProgressState,
            withNavigate: data.withNavigate
          }
        })

        await tx.answer.create({
          data: {
            roomId: room.id,
            order: 1,
            dateStart,
            questionId: nextQuestionId
          }
        })

        return room.id
      })

      return {
        success: true,
        data: roomId
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
