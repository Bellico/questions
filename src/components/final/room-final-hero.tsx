import { Confetti } from '@/components/commons/confetti'
import { RoomFinalRetry } from '@/components/final/room-final-retry'
import { Button } from '@/components/ui/button'
import { translate } from '@/queries/utils-queries'
import { ArrowDownToLine, Group } from 'lucide-react'
import Link from 'next/link'
import { PropsWithChildren } from 'react'

export async function RoomFinalHero({
  roomId,
  shareLink,
  canScroll,
  canRetry,
  playConfetti,
  children
} : PropsWithChildren<{
  roomId : string,
  shareLink? : string,
  canScroll : boolean,
  canRetry: boolean
  playConfetti: boolean
}>) {
  const { t } = await translate('room')

  return(
    <section className="relative flex min-h-[calc(100vh-65px)] items-center justify-center">

      {playConfetti && <Confetti />}

      <div className="container mt-[-65px] flex flex-col items-center space-y-7 text-center sm:space-y-10">

        <div className="animate-room-final">
          {playConfetti ?
            <h1 className="rainbow_text_animated text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">{t('Congrats')}</h1> :
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">{t('AllComplete')}</h1>
          }
        </div>

        {children}

        <div className="flex animate-fade-in opacity-0 delay-1000">
          {canRetry &&
            <RoomFinalRetry roomId={roomId} shareLink={shareLink} />
          }

          <Link href={'/'}>
            <Button variant="secondary" className="mr-4 sm:w-36">
              <Group className="mr-2" />
              {t('Leave')}
            </Button>
          </Link>
        </div>

      </div>

      {canScroll &&
        <div className="absolute inset-x-0 bottom-0 flex animate-bounce flex-col items-center">
          <p>{t('Scroll')}</p>
          <ArrowDownToLine />
        </div>
      }

    </section>
  )
}
