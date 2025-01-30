import { Loader } from '@/components/commons/loader'
import { BoardHeader } from '@/components/layouts/board-header'
import { Toaster } from '@/components/ui/toaster'
import { auth } from '@/lib/auth'
import { getUsername } from '@/queries/pages-queries'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function BoardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  const cookieStore = await cookies()
  const locale =  cookieStore.get('locale')?.value ?? 'en'
  const user = await getUsername(session.user.id!)

  return (
    <>
      <BoardHeader locale={locale} {...user} />
      <main>
        {children}
      </main>
      <Loader />
      <Toaster />
    </>
  )
}
