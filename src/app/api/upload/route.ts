import prisma from '@/lib/prisma'
import { getSessionUserIdOrThrow } from '@/queries/commons-queries'
import { createHash } from 'crypto'
import { notFound } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const userId = await getSessionUserIdOrThrow()
  const formData = await request.formData()
  const file = formData.get('image') as File | null

  if (!file) {
    return NextResponse.json({ success: false })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const hash = createHash('sha256').update(buffer).digest('hex')
  const base64 =  buffer.toString('base64')

  const existing = await prisma.images.findFirst({
    where:{
      authorId: userId,
      hash
    },
    select:{
      id: true
    }
  })

  if (existing) {
    return NextResponse.json({ success: true, url: `${process.env.PUBLIC_URL}/api/upload?id=${existing.id}` })
  }

  const newImg = await prisma.images.create({
    data:{
      name: file.name,
      filetype: file.type,
      authorId: userId,
      createdDate: new Date(),
      base64,
      hash
    }
  })

  return NextResponse.json({ success: true, url: `${process.env.PUBLIC_URL}/api/upload?id=${newImg.id}` })
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) notFound()

  const img = await prisma.images.findUniqueOrThrow({
    where:{
      id: id
    }
  })

  const buffer = Buffer.from(img?.base64!, 'base64')

  return new Response(buffer, { headers: { 'content-type': img.filetype } })
}
