import prisma from '@/lib/prisma'
import { isGroupOwnerOrThrow } from '@/queries/actions-queries'
import { getSessionUserIdOrThrow } from '@/queries/commons-queries'
import { notFound } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const userId = await getSessionUserIdOrThrow()
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) notFound()

  await isGroupOwnerOrThrow(id, userId)

  const groupsUsers = await prisma.groupsUsers.findMany({
    where:{
      groupId: id,
    },
    select: {
      user:{
        select:{
          id: true,
        }
      }
    }
  })

  const allUsers = await prisma.user.findMany({
    where:{
      id:{
        not: userId
      },
      emailVerified:{
        not : null
      },
    },
    select: {
      id: true,
      name: true,
      email: true
    },
    orderBy: [
      {
        name: 'asc',
      },
      {
        email: 'asc',
      }
    ],
  })

  return NextResponse.json({
    users: allUsers,
    sharedUsers: groupsUsers.map(g => g.user.id)
  })
}
