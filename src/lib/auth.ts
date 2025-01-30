import prisma from '@/lib/prisma'
import { sendVerificationAuthToken } from '@/lib/send-verification-auth-token'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { DefaultSession } from 'next-auth'
import NextAuth from 'next-auth'
import ForwardEmail from 'next-auth/providers/forwardemail'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id?: string
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    ForwardEmail({
      async sendVerificationRequest({ identifier: email, url }) {
        await sendVerificationAuthToken(email, url)
      },
    }),
  ],
  pages: {
    error: '/'
  },
  callbacks: {
    session({ session, user }) {
      if (!session?.user) return session

      session.user.id = user.id
      return session
    },
  },
  debug: false, // process.env.NODE_ENV === 'development'
})
