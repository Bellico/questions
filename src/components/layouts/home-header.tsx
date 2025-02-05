import { QEditorIcon } from '@/components/commons/q-editor-icon'
import { ThemeToggle } from '@/components/commons/theme-toogle'
import Link from 'next/link'

export const HomeHeader = () => (
  <header className="fixed top-0 z-50 w-full backdrop-blur-sm supports-backdrop-filter:bg-background/60">
    <div className="container flex h-16 items-center px-8">
      <nav className="flex flex-row items-center gap-6 text-sm font-medium md:gap-5">
        <Link className="flex items-center gap-2 font-bold" href="/">
          <QEditorIcon colored className="size-6" />
          Questions Editor
        </Link>
      </nav>
      <div className="ml-auto flex w-auto gap-2">
        <ThemeToggle />
      </div>
    </div>
  </header>
)
