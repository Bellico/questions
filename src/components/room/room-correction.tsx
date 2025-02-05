import { useRoomContext } from '@/components/providers/room-provider'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

type RoomCorrectionProps = {
  goToNext: () => void
}

export function RoomCorrection({ goToNext }: RoomCorrectionProps) {
  const { t } = useTranslation('global')

  const currentQuestion = useRoomContext(state => state.currentQuestion)
  const canGoNext = useRoomContext(state => state.canGoNext)
  const {correction, choices} = currentQuestion.navigate!
  const responses = currentQuestion.responses.map(r => ({...r, isCorrect : choices.includes(r.id) }))

  return(
    <>
      <div className="my-5 grid gap-4 md:grid-cols-2 md:gap-8">
        {responses.map((item, index) => (
          <div key={item.id} className={cn('min-h-24 rounded-xl border bg-accent shadow-xs transition-colors',{
            'border-destructive! line-through text-destructive': correction && !correction.includes(item.id) && choices.includes(item.id) ,
            'border-success bg-success': correction && correction.includes(item.id) && choices.includes(item.id),
            'border-success! border-dashed border-2': correction && correction.includes(item.id) && !choices.includes(item.id),
            'text-foreground/30': correction && !correction.includes(item.id) && !choices.includes(item.id)
          })}>

            <div className="relative size-full">
              <label className="flex size-full cursor-pointer items-center justify-start overflow-hidden" htmlFor={'qr-' + index}>
                <span className="whitespace-break-spaces py-5 pl-5 pr-16">{item.text}</span>
              </label>
              <Checkbox id={'qr-' + index} defaultChecked={item.isCorrect} className="absolute right-5 top-2/4 mt-[-14px] size-7" disabled={true} />
            </div>

          </div>
        ))}
      </div>

      {!canGoNext &&
        <form onSubmit={(e) => { e.preventDefault(); goToNext()}}>
          <Button className="m-auto mt-4 block h-12 w-full sm:h-10 sm:w-36" type="submit">
            {t('Next')}
          </Button>
        </form>
      }
    </>
  )
}
