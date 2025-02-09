import prisma from '@/lib/prisma'
import { isGroupOwnerOrThrow } from '@/queries/actions-queries'
import { getSessionUserIdOrThrow } from '@/queries/commons-queries'
import { notFound } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const userId = await getSessionUserIdOrThrow()
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) notFound()

  await isGroupOwnerOrThrow(id, userId)

  const group = await prisma.questionGroup.findUniqueOrThrow({
    where:{
      id: id,
      authorId: userId
    },
    select: {
      name: true,
      questions: {
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
    }
  })

  return new Response(
    JSON.stringify(group), {
      headers: {
        'content-type': 'application/json',
        'content-disposition': `attachment; filename=${group?.name}.json`,
      },
    })
}
