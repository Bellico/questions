
import prisma from '@/lib/prisma'
import { RoomProgressType } from '@/lib/schema'
import { getGroupInProgressQuery, getLastScoreByGroupQuery } from '@/queries/commons-queries'
import { RoomMode } from '@prisma/client'

export const getUsername = async (userId: string): Promise<{username: string | null, email: string, usePassword: boolean }> => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select:{
      name: true,
      email: true,
      password: true,
    }
  })

  return {
    username: user.name,
    email: user.email!,
    usePassword: user.password !== null
  }
}

export const getGroupName = async (groupId: string): Promise<string> => {
  const group = await prisma.questionGroup.findUniqueOrThrow({
    where: {
      id: groupId,
    },
    select:{
      name: true
    }
  })

  return group.name
}

export const getGroupsListQuery = async (userId: string) => {
  const groupList =  await prisma.questionGroup.findMany({
    where: {
      authorId: userId,
    },
    orderBy: {
      creationDate: 'desc',
    },
    include: {
      _count: {
        select: { questions: true, sharedUsers: true },
      },
    }
  })

  const groupIds = groupList.map(g => g.id)
  const activeRooms = await getGroupInProgressQuery(groupIds, userId)
  const lastScoreByGroup = await getLastScoreByGroupQuery(groupIds, userId)
  const resultsCountByGroup = await prisma.room.groupBy({
    by: ['groupId'],
    where: {
      mode: 'Rating',
      dateEnd: {
        not: null
      },
      groupId: {
        in: groupIds
      },
    },
    _count: true,
  })

  return groupList.map(g => ({
    id: g.id,
    name: g.name,
    version: g.version,
    questionsCount : g._count.questions,
    isShared : g._count.sharedUsers > 0,
    roomInProgress: activeRooms.some(p => p.groupId ===g.id),
    resultsCount: resultsCountByGroup.find(rc => rc.groupId === g.id)?._count ?? 0,
    lastTryDate: lastScoreByGroup.find(sc => sc.id === g.id)?.rooms[0]?.dateEnd ?? null,
    lastScore: lastScoreByGroup.find(sc => sc.id === g.id)?.rooms[0]?.score ?? null,
  }))
}

export const getSharingGroupsListQuery = async (userId: string) => {
  const groupsUsers =  await prisma.groupsUsers.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      group:{
        name: 'asc'
      }
    },
    include: {
      group:{
        include:{
          author:{
            select:{
              name: true,
              email: true,
            }
          },
          _count: {
            select: { questions: true },
          },
        }
      }
    }
  })

  const groupIds = groupsUsers.map(g => g.groupId)
  const activeRooms = await getGroupInProgressQuery(groupIds, userId)
  const lastScoreByGroup = await getLastScoreByGroupQuery(groupIds, userId)

  return groupsUsers.map(g => ({
    id: g.group.id,
    name: g.group.name,
    questionsCount : g.group._count.questions,
    author: g.group.author.name ?? g.group.author.email,
    roomInProgress: activeRooms.some(p => p.groupId === g.groupId),
    lastTryDate: lastScoreByGroup.find(sc => sc.id === g.groupId)?.rooms[0]?.dateEnd ?? null,
    lastScore: lastScoreByGroup.find(sc => sc.id === g.groupId)?.rooms[0]?.score ?? null,
  }))
}

export const getEditorQuery = async (groupId: string, userId: string) => {
  return await prisma.questionGroup.findUnique({
    where: {
      id: groupId,
      authorId: userId,
    },
    select: {
      id: true,
      name: true,
      questions: {
        orderBy: {
          order: 'asc'
        },
        select: {
          id: true,
          title: true,
          subject: true,
          order: true,
          responses: {
            select: {
              id: true,
              text: true,
              isCorrect: true
            }
          }
        }
      }
    },
  })
}

export const getStatsQuery = async (userId: string) => {
  const groupCount = await prisma.questionGroup.count({
    where: {
      authorId: userId,
    }
  })

  const questionCount = await prisma.question.count({
    where: {
      group: {
        authorId: userId
      }
    }
  })

  const roomScore = await prisma.room.aggregate({
    where: {
      userId: userId,
      dateEnd: {
        not: null
      },
      mode: RoomMode.Rating,
    },
    _count: true,
    _avg: {
      score: true
    }
  })

  const answerCount = await prisma.answer.count({
    where: {
      room:{
        userId: userId,
        dateEnd: {
          not: null
        },
        mode: RoomMode.Rating,
      }
    }
  })

  const answerFailedCount = await prisma.answer.count({
    where: {
      achievement:{
        lt: 100
      },
      room:{
        userId: userId,
        dateEnd: {
          not: null
        },
        mode: RoomMode.Rating,
      }
    }
  })

  const [{ round: avgAnwserTime }] = await prisma.$queryRaw`
    SELECT ROUND(AVG(
      ((DATE_PART('day', a."dateEnd"::timestamp - a."dateStart"::timestamp) * 24 +
      DATE_PART('hour', a."dateEnd"::timestamp - a."dateStart"::timestamp)) * 60 +
      DATE_PART('minute', a."dateEnd"::timestamp - a."dateStart"::timestamp)) * 60 +
      DATE_PART('second', a."dateEnd"::timestamp - a."dateStart"::timestamp)
    )) FROM "Answer" a
       INNER JOIN "Room" r ON a."roomId" = r."id"
       WHERE r."userId" = ${userId}
       AND r."dateEnd" IS NOT NULL
       AND r."mode"::text = ${RoomMode.Rating}` as [{ round : number}]

  const [{ round: totalTime }] = await prisma.$queryRaw`
    SELECT ROUND(SUM(
      ((DATE_PART('day', a."dateEnd"::timestamp - a."dateStart"::timestamp) * 24 +
      DATE_PART('hour', a."dateEnd"::timestamp - a."dateStart"::timestamp)) * 60 +
      DATE_PART('minute', a."dateEnd"::timestamp - a."dateStart"::timestamp)) * 60 +
      DATE_PART('second', a."dateEnd"::timestamp - a."dateStart"::timestamp)
    )) FROM "Answer" a
       INNER JOIN "Room" r ON a."roomId" = r."id"
       WHERE r."userId" = ${userId}
       AND r."dateEnd" IS NOT NULL
       AND r."mode"::text = ${RoomMode.Rating}` as [{ round : number}]

  return {
    avgScore: roomScore._avg.score !== null ? Math.round(roomScore._avg.score) : null,
    roomCount: roomScore._count,
    groupCount,
    questionCount,
    answerCount,
    answerFailedCount,
    avgAnwserTime,
    totalTime
  }
}

export const getGroupStatsQuery = async (userId: string, groupId: string) => {
  const groupCount = 1

  const questionCount = await prisma.question.count({
    where: {
      groupId: groupId
    }
  })

  const roomScore = await prisma.room.aggregate({
    where: {
      userId: userId,
      groupId: groupId,
      mode: RoomMode.Rating,
    },
    _count: true,
    _avg: {
      score: true
    }
  })

  const answerCount = await prisma.answer.count({
    where: {
      room:{
        userId: userId,
        groupId: groupId,
        mode: RoomMode.Rating,
      }
    }
  })

  const answerFailedCount = await prisma.answer.count({
    where: {
      achievement:{
        lt: 100
      },
      room:{
        userId: userId,
        groupId: groupId,
        mode: RoomMode.Rating,
      }
    }
  })

  const [{ round: avgAnwserTime }] = await prisma.$queryRaw`
    SELECT ROUND(AVG(
      ((DATE_PART('day', a."dateEnd"::timestamp - a."dateStart"::timestamp) * 24 +
      DATE_PART('hour', a."dateEnd"::timestamp - a."dateStart"::timestamp)) * 60 +
      DATE_PART('minute', a."dateEnd"::timestamp - a."dateStart"::timestamp)) * 60 +
      DATE_PART('second', a."dateEnd"::timestamp - a."dateStart"::timestamp)
    )) FROM "Answer" a
       INNER JOIN "Room" r ON a."roomId" = r."id"
       WHERE r."userId" = ${userId}
       AND r."mode"::text = ${RoomMode.Rating}
       AND r."groupId" = ${groupId}` as [{ round : number}]

  const [{ round: totalTime }] = await prisma.$queryRaw`
    SELECT ROUND(SUM(
      ((DATE_PART('day', a."dateEnd"::timestamp - a."dateStart"::timestamp) * 24 +
      DATE_PART('hour', a."dateEnd"::timestamp - a."dateStart"::timestamp)) * 60 +
      DATE_PART('minute', a."dateEnd"::timestamp - a."dateStart"::timestamp)) * 60 +
      DATE_PART('second', a."dateEnd"::timestamp - a."dateStart"::timestamp)
    )) FROM "Answer" a
       INNER JOIN "Room" r ON a."roomId" = r."id"
       WHERE r."userId" = ${userId}
       AND r."mode"::text = ${RoomMode.Rating}
       AND r."groupId" = ${groupId}` as [{ round : number}]

  return {
    avgScore: roomScore._avg.score !== null ? Math.round(roomScore._avg.score) : null,
    roomCount: roomScore._count,
    groupCount,
    questionCount,
    answerCount,
    answerFailedCount,
    avgAnwserTime,
    totalTime
  }
}

export const getGroupForStartQuery = async (groupId: string) => {
  return await prisma.questionGroup.findUniqueOrThrow({
    where: {
      id: groupId,
    },
    include: {
      _count: {
        select: { questions: true },
      },
    }
  })
}

export const getGroupForShareQuery = async (groupId: string, shareLink: string) => {
  return await prisma.room.findUnique({
    where: {
      id: groupId,
      shareLink: shareLink,
      dateEnd: null
    },
    select: {
      id: true,
      dateStart: true,
      mode: true,
      group:{
        include:{
          _count: {
            select: { questions: true },
          },
        }
      }
    }
  })
}

export const getLastSettingsRoomQuery = async (groupId: string, userId: string) => {
  // Last setting of same group
  let settings = await prisma.room.findFirst({
    where: {
      groupId: groupId,
      userId: userId,
    },
    orderBy:{
      dateStart: 'desc'
    },
    select:{
      mode: true,
      withRandom: true,
      withRetry: true,
      withCorrection: true,
      withResults: true,
      withProgress: true,
      withProgressState: true,
      withNavigate: true
    }
  })

  // if not any last settings
  if (!settings) {
    settings = await prisma.room.findFirst({
      where: {
        userId: userId,
      },
      orderBy:{
        dateStart: 'desc'
      },
      select:{
        mode: true,
        withRetry: true,
        withRandom: true,
        withCorrection: true,
        withResults: true,
        withProgress: true,
        withProgressState: true,
        withNavigate: true
      }
    })
  }

  // Or Default
  if (!settings) return {
    groupId: groupId,
    mode: 'Training' as 'Training' | 'Rating',
    withRetry: 0,
    withRandom: false,
    withCorrection: false,
    withResults: false,
    withProgress: false,
    withProgressState: false,
    withNavigate: false
  }

  return { ...settings, withRetry: settings.withRetry ?? 0, groupId }
}

export const getProgressInfosRoomQuery = async (roomId: string, groupId: string, withResult: boolean) : Promise<RoomProgressType[]> => {
  const questions = await prisma.question.findMany({
    where: {
      groupId: groupId
    },
    select: {
      id: true,
      title: true
    },
    orderBy:{
      order: 'asc'
    }
  })

  const answers = await prisma.answer.findMany({
    where: {
      roomId: roomId,
      dateEnd:{
        not : null
      }
    },
    select: {
      questionId: true,
      achievement: true,
    }
  })

  const progress = questions.map((q, i) => {
    const answer = answers.find(a => a.questionId === q.id)

    return {
      id: q.id,
      title: q.title || `Question ${i + 1}`,
      hasGood : withResult && answer ? answer.achievement === 100 : null,
      isAnswer : !!answer,
    }
  })

  return progress
}

export const getProgressInfosWithRandomQuery = async (roomId: string, groupId: string, withResult: boolean) : Promise<RoomProgressType[]> => {
  const questions = await prisma.question.count({
    where: {
      groupId: groupId
    }
  })

  const answers = await prisma.answer.findMany({
    where: {
      roomId: roomId,
    },
    select: {
      questionId: true,
      achievement: true,
      question:{
        select:{
          id: true,
          title: true
        }
      }
    },
    orderBy:{
      order: 'asc'
    }
  })

  // Already knows
  const progress = answers.map((answer, i) => ({
    id: answer.questionId,
    title: answer?.question?.title || `Question ${i + 1}`,
    hasGood: withResult && answer.achievement !== null ? answer.achievement === 100 : null,
    isAnswer: answer.achievement !== null,
  }))

  // Fill next questions
  for (let i = progress.length ; i < questions; i++) {
    progress.push({
      id: null,
      title: `Question ${i + 1}`,
      hasGood: null,
      isAnswer: false,
    })
  }

  return progress
}

export const canViewFinalRoomQuery = async (roomId: string, userId?: string, shareLink?: string) => {
  return await prisma.room.findFirst({
    where: {
      id: roomId,
      dateEnd: {
        not: null
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
      score: true,
      withResults: true,
      withRetry: true
    }
  })
}

export const getRoomFinalScoreQuery = async (roomId: string) => {
  const results = await prisma.room.findFirstOrThrow({
    where:{
      id: roomId,
      dateEnd: {
        not: null
      }
    },
    select:{
      score: true,
      successCount: true,
      failedCount: true,
      dateStart: true,
      dateEnd: true,
    }
  })

  return {
    score: results.score,
    success: results.successCount,
    failed: results.failedCount,
    count : results.successCount! +  results.failedCount!,
    dateStart: results.dateStart,
    dateEnd: results.dateEnd,
  }
}

export const getRoomFinalResumeQuery = async (roomId: string) => {
  return await prisma.answer.findMany({
    where:{
      roomId: roomId,
      dateEnd: {
        not: null
      }
    },
    select:{
      id: true,
      achievement: true,
      order: true,
      dateStart: true,
      dateEnd: true,
      choices:{
        select:{
          responseId: true
        }
      },
      question:{
        select:{
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
      },
    },
    orderBy:{
      order:'asc'
    }
  })
}

export const getRoomBoardQuery = async (groupId: string, mode: RoomMode) => {
  return await prisma.room.findMany({
    where: {
      groupId: groupId,
      mode,
      dateEnd:{
        not : null
      }
    },
    orderBy: {
      dateStart: 'asc',
    },
    select:{
      id: true,
      score: true,
      successCount: true,
      failedCount: true,
      dateStart: true,
      dateEnd: true,
      withRetry: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })
}

export const getAnwsersBoardQuery = async (groupId: string, userId: string) => {
  return await prisma.$queryRaw`
    SELECT
      a."questionId",
      CASE
          WHEN (q."title" IS NOT NULL AND q."title" <> '')
          THEN CONCAT('Question', ' ', q."order", ' ', '(', q."title", ')')
          ELSE CONCAT('Question', ' ', q."order")
      END AS "title",

      CAST (SUM(
        CASE WHEN a."achievement" = 100 THEN 1 ELSE 0 END
      ) AS INTEGER) AS "successCount",
      CAST (COUNT(*) AS INTEGER) AS "totalCount",

      ROUND(AVG(
        ((DATE_PART('day', a."dateEnd"::timestamp - a."dateStart"::timestamp) * 24 +
        DATE_PART('hour', a."dateEnd"::timestamp - a."dateStart"::timestamp)) * 60 +
        DATE_PART('minute', a."dateEnd"::timestamp - a."dateStart"::timestamp)) * 60 +
        DATE_PART('second', a."dateEnd"::timestamp - a."dateStart"::timestamp)
     )) AS "avgAnwserTime"

     FROM "Answer" a
     INNER JOIN "Room" r ON a."roomId" = r."id"
     INNER JOIN "Question" q ON a."questionId" = q."id"
     WHERE r."userId" = ${userId}
     AND r."groupId" = ${groupId}
     AND r."mode"::text = ${RoomMode.Rating}
     AND a."questionId" IS NOT NULL
     GROUP BY a."questionId", q."order", q."title"
     ORDER BY q."order"` as [{
      questionId: string,
      title: string,
      avgAnwserTime: number,
      successCount: number,
      totalCount: number
    }]
}
