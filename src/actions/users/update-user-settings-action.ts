'use server'

import { ActionResultType, withValidateAndSession } from '@/actions/wrapper-actions'
import prisma from '@/lib/prisma'
import { UserSettingsSchema, UserSettingsType } from '@/lib/schema'
import { capitalize } from '@/lib/utils'
import { createHmac } from 'crypto'
import { cookies } from 'next/headers'

export const updateUserSettingsAction = withValidateAndSession(
  UserSettingsSchema,
  async (data: UserSettingsType, userId: string): Promise<ActionResultType<void>> => {

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        name: data.username ? capitalize(data.username) : null,
      },
    })

    if (data.usePassword && data.password) {
      const passwordHash = createHmac('sha256', process.env.NEXTAUTH_SECRET!).update(data.password).digest('hex')

      await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          password: passwordHash,
        },
      })
    }

    if (!data.usePassword) {
      await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          password: null,
        },
      })
    }

    const cookieStore = await cookies()
    cookieStore.set('locale', data.locale, { maxAge: Date.now() })

    return {
      success: true
    }
  })
