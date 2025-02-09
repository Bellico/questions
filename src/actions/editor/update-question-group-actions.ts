'use server'

import { ActionResultType, withValidateAndSession } from '@/actions/wrapper-actions'
import prisma from '@/lib/prisma'
import { QuestionGroupSchema, QuestionGroupType } from '@/lib/schema'
import { isGroupOwnerOrThrow } from '@/queries/actions-queries'
import { getGroupInProgressQuery } from '@/queries/commons-queries'
import { translate } from '@/queries/utils-queries'
import { Prisma } from '@prisma/client'

import { revalidatePath } from 'next/cache'

export const updateQuestionGroupAction = withValidateAndSession(
  QuestionGroupSchema,
  async (data: QuestionGroupType, userId: string): Promise<ActionResultType<void>> => {

    const { t } = await translate('actions')

    await isGroupOwnerOrThrow(data.id!, userId)

    const activeRooms = await getGroupInProgressQuery([data.id!], userId)
    if (activeRooms.length > 0) {
      return {
        success: false,
        message: t('RoomInProgress'),
      }
    }

    try {
      await prisma.$transaction(async (tx) => {

        // 1. Update group
        await tx.questionGroup.update({
          where: {
            id: data.id!,
          },
          data: {
            name: data.name,
            updateDate: new Date(),
            version: { increment: 1 }
          },
        })

        // 2. Delete old Questions
        const questionIdToKeep = data.questions.filter(q => !!q.id).map(q => q.id!)
        await tx.question.deleteMany({
          where: {
            id: {
              notIn: questionIdToKeep
            },
            groupId: {
              equals: data.id!
            }
          },
        })

        // 3. Update existing Questions Or Create New With Responses
        for (let i = 0; i < data.questions.length; i++) {
          const q = data.questions[i]

          await tx.question.upsert({
            where: {
              id: q.id || '0'
            },
            create: {
              groupId: data.id!,
              title: q.title,
              subject: q.subject,
              order: q.order,
              responses: {
                create: q.responses.filter(r => !!r.text).map(r => ({
                  isCorrect: r.isCorrect,
                  text: r.text
                }))
              }
            },
            update: {
              title: q.title,
              order: q.order,
              subject: q.subject
            }
          })
        }

        // 4. Create / Update / Delete Responses for Updated Questions
        const updatedQuestion = data.questions.filter(q => !!q.id)
        for (let i = 0; i < updatedQuestion.length; i++) {

          const q = updatedQuestion[i]
          // Delete
          await tx.response.deleteMany({
            where: {
              id: {
                notIn: q.responses.filter(r => !!r.id).map(r => r.id!)
              },
              questionId: {
                equals: q.id!
              }
            }
          })

          for (let j = 0; j < q.responses.length; j++) {

            const r = q.responses[j]
            if (!r.text) continue

            await tx.response.upsert({
              where: {
                id: r.id || '0'
              },
              create: {
                questionId: q.id!,
                text: r.text,
                isCorrect: r.isCorrect
              },
              update: {
                text: r.text,
                isCorrect: r.isCorrect
              },
            })
          }
        }
      }, {
        timeout: 5000
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
