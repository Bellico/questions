import { useRoomContext } from '@/components/providers/room-provider'
import { cn } from '@/lib/utils'
import { MDXEditorMethods } from '@mdxeditor/editor'
import { CheckCheck, XCircle } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'

const QReaderMarkdown = dynamic(() => import('../mdx/mdx-markdown-reader'), {
  ssr: false
})

export function RoomSubject() {
  const currentQuestion = useRoomContext(state => state.currentQuestion)
  const qEditorMarkdownRef = useRef<MDXEditorMethods>(null)
  const shouldCenterSubject = !currentQuestion.subject.includes('\n')

  useEffect(() => {
    qEditorMarkdownRef.current?.setMarkdown(currentQuestion.subject)
  },[currentQuestion.subject])

  return(
    <>
      {currentQuestion.navigate?.correction ?
        <h1 className="title flex flex-col items-center justify-center">
          <span>{currentQuestion.title}</span>
          {currentQuestion.navigate.hasGood && <CheckCheck className="mt-2 size-11 animate-fade-in text-success opacity-0" />}
          {!currentQuestion.navigate.hasGood && <XCircle className="mt-2 size-11 animate-fade-in text-destructive opacity-0" />}
        </h1>:

        <h1 className="title">{currentQuestion.title}</h1>
      }

      <div className={cn({'text-center': shouldCenterSubject})}>
        <QReaderMarkdown ref={qEditorMarkdownRef} markdown={currentQuestion.subject}  />
      </div>
    </>
  )
}

