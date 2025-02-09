'use server'

import { ActionResultType, withValidate } from '@/actions/wrapper-actions'
import prisma from '@/lib/prisma'
import { createHmac, randomUUID } from 'crypto'
import { cookies } from 'next/headers'
import { z } from 'zod'

const loginSchema =  z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export const loginPasswordUserAction = withValidate(
  loginSchema,
  async (data: z.infer<typeof loginSchema>): Promise<ActionResultType<void>> => {

    const passwordHash = createHmac('sha256', process.env.NEXTAUTH_SECRET!).update(data.password).digest('hex')

    const user = await prisma.user.findFirst({
      where:{
        email: data.email,
        password: passwordHash
      },
      select:{
        id: true
      }
    })

    if (!user) {
      return {
        success: false
      }
    }

    const maxAge = 30 * 24 * 60 * 60
    const session = await prisma.session.create({
      data:{
        userId: user.id,
        sessionToken:  randomUUID(),
        expires: new Date(Date.now() + maxAge * 1000),
      }
    })

    const cookieName = process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
    const cookieStore = await cookies()
    cookieStore.set(cookieName, session.sessionToken, {
      expires: session.expires,
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return {
      success: true
    }
  })
