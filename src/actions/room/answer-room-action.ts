'use server'

import { ActionResultType, withValidate } from '@/actions/wrapper-actions'
import prisma from '@/lib/prisma'
import { AnswerRoomReturnType, AnswerRoomSchema, AnswerRoomType } from '@/lib/schema'
import { computeAchievement, computeScore } from '@/lib/utils'
import { computeNextQuestionQuery } from '@/queries/actions-queries'
import { getNextQuestionToAnswerQuery, getSessionUserId } from '@/queries/commons-queries'
import { translate } from '@/queries/utils-queries'
import { Prisma } from '@prisma/client'

export const answerRoomAction = withValidate(
  AnswerRoomSchema,
  async (data: AnswerRoomType): Promise<ActionResultType<AnswerRoomReturnType>> => {

    const { t } = await translate('actions')

    const userId = await getSessionUserId()
    const currentAnswerContext = await canAnswerQuestion(data.roomId, data.questionId, userId, data.shareLink)

    if (!currentAnswerContext) {
      throw new Error('403 Forbidden')
    }

    const goodResponseIds = currentAnswerContext.question?.responses.map(r => r.id)!
    const goodChoicesCount = goodResponseIds.filter(rId => data.choices.includes(rId)).length
    const achievement = computeAchievement(goodChoicesCount, goodResponseIds.length, data.choices.length)

    const answeredQuestionIds = await getAnsweredQuestionIdsInRoom(data.roomId)
    const nextQuestionId = await computeNextQuestionQuery(currentAnswerContext.room.groupId!, currentAnswerContext.room.withRandom, answeredQuestionIds)
    const dateEnd = new Date()
    try {
      await prisma.$transaction(async (tx) => {

        await tx.answer.update({
          where: {
            id: currentAnswerContext.id
          },
          data: {
            achievement,
            dateEnd,
            choices: {
              create: data.choices.map(rId => ({ responseId: rId }))
            }
          }
        })

        // Prepare next question if exists
        if (nextQuestionId) {
          await tx.answer.create({
            data: {
              roomId: data.roomId,
              order: currentAnswerContext.order + 1,
              dateStart: dateEnd,
              questionId: nextQuestionId
            }
          })
        }

        // Else End room
        else {
          const results = await tx.answer.findMany({
            where:{
              roomId: data.roomId,
            },
            select:{
              achievement: true
            }
          })

          const score = computeScore(results.map(r => r.achievement!))

          await tx.room.update({
            where: {
              id: data.roomId
            },
            data: {
              score: score.score,
              successCount: score.success,
              failedCount: score.failed,
              dateEnd
            },
          })
        }

      })
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

    return {
      success: true,
      data: {
        next: await getNextQuestionToAnswerQuery(data.roomId),
        result: {
          id: currentAnswerContext.question?.id!,
          title : currentAnswerContext.question?.title || `Question ${currentAnswerContext.order}`,
          hasGood : currentAnswerContext.room.withProgressState ? achievement === 100 : null,
          correction: currentAnswerContext.room.withCorrection ? goodResponseIds : null
        }
      }
    }
  })

const canAnswerQuestion = async (roomId: string, questionId: string, userId?: string, shareLink?: string) => {
  const result = await prisma.answer.findFirstOrThrow({
    where: {
      questionId: questionId,
      dateEnd: null,
      room:{
        id: roomId,
        dateEnd: null,
        AND:{
          OR: [
            {
              userId: userId,
            },
            {
              shareLink: shareLink ?? '',
            },
          ]
        }
      }
    },
    select: {
      id: true,
      order: true,
      room:{
        select:{
          groupId: true,
          mode: true,
          withCorrection: true,
          withRandom: true,
          withProgressState: true
        }
      },
      question:{
        select: {
          id: true,
          title: true,
          responses:{
            where:{
              isCorrect: true
            },
            select:{
              id: true,
            }
          }
        }
      }
    }
  })

  return result!
}

const getAnsweredQuestionIdsInRoom = async (roomId: string) => {
  const questionIds = await prisma.answer.findMany({
    where: {
      roomId: roomId,
    },
    select:{
      questionId: true,
    },
  })

  return questionIds.map(q => q.questionId!)
}
