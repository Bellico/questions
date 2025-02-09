'use server'

import { ActionResultType, withValidate } from '@/actions/wrapper-actions'
import prisma from '@/lib/prisma'
import { PrevNextRoomSchema, PrevNextRoomType, RoomQuestionNextType } from '@/lib/schema'
import { canPlayRoomQuery, getNextQuestionToAnswerQuery, getSessionUserId } from '@/queries/commons-queries'

export const navigateRoomAction = withValidate(
  PrevNextRoomSchema,
  async (data: PrevNextRoomType): Promise<ActionResultType<RoomQuestionNextType>> => {

    const userId = await getSessionUserId()
    const room = await canPlayRoomQuery(data.roomId, userId, data.shareLink)

    if (!room || !room.withNavigate) {
      throw new Error('403 Forbidden')
    }

    const navigate = data.questionId ?
      await getQuestionToNavigate(data.roomId, data.questionId) :
      await getNextQuestionToAnswerQuery(data.roomId)

    if (!navigate) {
      throw new Error('403 Forbidden')
    }

    return {
      success: true,
      data: navigate
    }
  })

const getQuestionToNavigate = async (roomId: string, questionId: string) : Promise<RoomQuestionNextType> => {
  const result = await prisma.answer.findFirstOrThrow({
    where: {
      questionId: questionId,
      room:{
        id: roomId,
        dateEnd: null,
      }
    },
    select: {
      order: true,
      dateEnd: true,
      achievement: true,
      choices:{
        select:{
          responseId: true
        }
      },
      room:{
        select: {
          withCorrection: true
        }
      },
      question:{
        select: {
          id: true,
          title: true,
          subject: true,
          responses:{
            select:{
              id: true,
              text: true,
              isCorrect: true
            }
          }
        }
      }
    }
  })

  return {
    questionId : result.question?.id!,
    title: result?.question?.title || `Question ${result.order}`,
    subject: result.question?.subject!,
    responses: result.question?.responses.map(r => ({ id: r.id, text: r.text }))!,
    navigate: result.dateEnd === null ? undefined : {
      hasGood: result.achievement === 100,
      correction: result.room.withCorrection ? result.question?.responses.filter(r => r.isCorrect).map(r => r.id)! : null,
      choices: result.choices.map(c => c.responseId)
    }
  }
}
