import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Fix "try another account" ==> invalid prisma session delete
  const cookieName = process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
  const cookieStore = await cookies()
  cookieStore.delete(cookieName)

  const url = new URL(request.url)
  const email = url.searchParams.get('email')

  const user = await prisma.user.findFirst({
    where:{
      email: email,
    },
    select: {
      password: true
    }
  })

  return NextResponse.json({
    goToLogin: Boolean(user && user.password !== null)
  })
}
