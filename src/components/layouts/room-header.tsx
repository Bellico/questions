import { QEditorIcon } from '@/components/commons/q-editor-icon'
import { ThemeToggle } from '@/components/commons/theme-toogle'
import { Button } from '@/components/ui/button'
import { translate } from '@/queries/utils-queries'
import { SquareX } from 'lucide-react'

export const RoomHeader = async () =>{
  const { t } = await translate('global')

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex flex-1 gap-2">
          {/* Not use next link for cache trouble */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">
            <Button variant="ghost">
              <SquareX className="sm:mr-2" />
              <span className='hidden sm:inline'>{t('Back')}</span>
            </Button>
          </a>
        </div>
        <div className="flex flex-auto items-center justify-center gap-2 text-sm font-bold">
          <QEditorIcon colored className="size-6" />
            Questions Editor
        </div>
        <div className="ml-0 flex flex-1 justify-end gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
