'use server'

import { ActionResultType, withValidateAndSession } from '@/actions/wrapper-actions'
import prisma from '@/lib/prisma'
import { RoomShareSchema, RoomShareType } from '@/lib/schema'
import { isGroupOwnerOrThrow } from '@/queries/actions-queries'
import { translate } from '@/queries/utils-queries'
import { Prisma } from '@prisma/client'

export const shareRoomAction = withValidateAndSession(
  RoomShareSchema,
  async (data: RoomShareType, userId: string): Promise<ActionResultType<string>> => {

    const { t } = await translate('actions')

    await isGroupOwnerOrThrow(data.groupId, userId)

    let friend = await prisma.user.findUnique({
      where:{
        email: data.usermail
      }
    })

    try {
      const room = await prisma.$transaction(async (tx) => {

        if (!friend) {
          friend = await tx.user.create({
            data:{
              email: data.usermail
            }
          })
        }

        const room = await tx.room.create({
          data: {
            groupId: data.groupId,
            userId: friend.id,
            mode: data.mode,
            withRetry: data.withRetry > 0 ? Number(data.withRetry) : null,
            withResults: data.withResults,
            withCorrection: data.withCorrection,
            withRandom: data.withRandom,
            withProgress: data.withProgress,
            withProgressState: data.withProgress && data.withProgressState,
            withNavigate: data.withNavigate,
            shareLink: crypto.randomUUID()
          }
        })

        return room
      })

      const shareUrl = `${process.env.PUBLIC_URL}/share/${room.id}/?shareLink=${room.shareLink}`

      return {
        success: true,
        data: shareUrl
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
