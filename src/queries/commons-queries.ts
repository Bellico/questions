import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { RoomQuestionNextType } from '@/lib/schema'

export const getSessionUserId = async (): Promise<string | undefined> => {
  const session = await auth()

  return session?.user?.id
}

export const getSessionUserIdOrThrow = async (): Promise<string> => {
  const session = await auth()

  if (!session) {
    throw new Error('401 Unauthorized')
  }

  return session.user.id!
}

export const isGroupOwner = async (groupId: string, userId: string): Promise<boolean> => {
  const isOwner = await prisma.questionGroup.count({
    where: {
      id: groupId,
      authorId: userId
    }
  })

  return isOwner === 1
}

export const canAccessGroup = async (groupId: string, userId: string): Promise<{ canAccess: boolean, isAuthor: boolean }> => {
  const isOwner = await prisma.questionGroup.count({
    where: {
      id: groupId,
      authorId: userId
    }
  })

  if (isOwner == 1) {
    return { canAccess: true, isAuthor: true }
  }

  const groupsUser = await prisma.groupsUsers.findFirst({
    where: {
      groupId: groupId,
      userId: userId
    }
  })

  return groupsUser !== null ?
    { canAccess: true, isAuthor: false } :
    { canAccess: false, isAuthor: false }
}

export const canPlayRoomQuery = async (roomId: string, userId?: string, shareLink?: string) => {
  return await prisma.room.findFirst({
    where: {
      id: roomId,
      dateStart:{
        not: null
      },
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
    },
    select: {
      id: true,
      groupId: true,
      withRandom: true,
      withProgress: true,
      withProgressState: true,
      withNavigate: true
    }
  })
}

export const getNextQuestionToAnswerQuery = async (roomId: string) : Promise<RoomQuestionNextType | null> => {
  const result = await prisma.answer.findFirst({
    where: {
      roomId: roomId,
      dateEnd: null,
    },
    select: {
      order: true,
      question:{
        select: {
          id: true,
          title: true,
          subject: true,
          responses:{
            select:{
              id: true,
              text: true
            }
          }
        }
      }
    }
  })

  if (result?.question) {
    return {
      questionId : result.question.id,
      title: result?.question?.title || `Question ${result.order}`,
      subject: result.question.subject,
      responses: result.question.responses,
    }
  }

  return null
}

export const getGroupInProgressQuery = async (groupIds: string[], userId: string) => {
  return await prisma.room.findMany({
    where: {
      dateStart: {
        not: null,
        // gte: new Date(new Date().getTime() - 3600 * 1000),
      },
      userId: userId,
      dateEnd: null,
      groupId: {
        in: groupIds
      },
    },
    orderBy:{
      dateStart: 'desc'
    },
    select:{
      id: true,
      groupId: true
    }
  })
}

export const getLastScoreByGroupQuery = async (groupIds: string[], userId: string) => {
  return await prisma.questionGroup.findMany({
    where: {
      id: {
        in: groupIds
      },
    },
    select:{
      id: true,
      rooms: {
        where:{
          mode: 'Rating',
          userId: userId,
          dateEnd: {
            not: null
          },
        },
        orderBy : {
          dateEnd: 'desc'
        },
        take: 1,
        select:{
          score: true,
          dateEnd: true
        }
      }
    }
  })
}
