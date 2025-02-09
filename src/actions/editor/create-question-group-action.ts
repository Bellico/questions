'use server'

import { ActionResultType, withValidateAndSession } from '@/actions/wrapper-actions'
import prisma from '@/lib/prisma'
import { QuestionGroupSchema, QuestionGroupType } from '@/lib/schema'
import { translate } from '@/queries/utils-queries'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const createQuestionGroupAction = withValidateAndSession(
  QuestionGroupSchema,
  async (data: QuestionGroupType, userId: string): Promise<ActionResultType<string>> => {

    const { t } = await translate('actions')

    const existingName =  await prisma.questionGroup.findFirst({
      where:{
        name: data.name,
        authorId: userId
      }
    })

    if (existingName) {
      return {
        success: false,
        message: t('ExistingGroup', { groupName : data.name }),
      }
    }

    try {
      const group = await prisma.questionGroup.create({
        data: {
          name: data.name,
          creationDate: new Date(),
          updateDate: new Date(),
          version: 1,
          authorId: userId,
          questions: {
            create: data.questions.map(q => {
              return {
                title: q.title,
                subject: q.subject,
                order: q.order,
                responses: {
                  create: q.responses.filter(r => !!r.text).map(r => ({
                    isCorrect: r.isCorrect,
                    text: r.text
                  }))
                }
              }
            })
          }
        },
      })

      revalidatePath('/board')

      return {
        success: true,
        data: group.id
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
