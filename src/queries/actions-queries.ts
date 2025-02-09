import 'server-only'

import prisma from '@/lib/prisma'
import { RoomMode } from '@prisma/client'

export const isGroupOwnerOrThrow = async (groupId: string, userId: string): Promise<boolean> => {
  const isOwner = await prisma.questionGroup.count({
    where: {
      id: groupId,
      authorId: userId
    }
  })

  if (isOwner == 0) {
    throw new Error('403 Forbidden')
  }

  return true
}

export const isRoomOwner = async (roomId: string, userId: string) => {
  const isOwner = await prisma.room.count({
    where: {
      id: roomId,
      group:{
        authorId: userId
      }
    }
  })

  return isOwner === 1
}

export const canRetryRoomQuery = async (roomId: string, userId?: string, shareLink?: string) => {
  return await prisma.room.findFirstOrThrow({
    where: {
      id: roomId,
      dateEnd: {
        not: null
      },
      withRetry: {
        gt: 0
      },
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
    },
    select: {
      id: true,
      groupId: true,
      withRandom: true,
    }
  })
}

export const computeNextQuestionQuery = async (groupId: string, withRandom: boolean, alreadyAnsweredQuestionId: string[]) => {
  const availableQuestions = await prisma.question.findMany({
    where: {
      id: {
        notIn: alreadyAnsweredQuestionId
      },
      groupId: groupId
    },
    select:{
      id: true,
    },
    orderBy:{
      order: 'asc'
    }
  })

  if (availableQuestions.length === 0) {
    return null
  }

  const questionIds = availableQuestions.map(q => q.id)
  let nextQuestionId = questionIds[0]

  if (withRandom) {
    nextQuestionId = questionIds[Math.floor(Math.random() * questionIds.length)]
  }

  return nextQuestionId
}

export const canDeleteRoomQuery = async (roomId: string, userId?: string) => {
  return await prisma.room.findFirstOrThrow({
    where: {
      id: roomId,
      mode: RoomMode.Rating,
      dateEnd: {
        not: null
      },
      group:{
        authorId: userId
      }
    },
    select: {
      id: true,
    }
  })
}
