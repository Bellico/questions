import { useRoomContext } from '@/components/providers/room-provider'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAutoSubmit } from '@/hooks/useAutoSubmit'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useShallow } from 'zustand/react/shallow'

const RoomResponsesSchema = z.object({
  responses: z.array(z.object({
    id: z.string(),
    text: z.string(),
    isCorrect: z.boolean().nullish(),
  })).refine((value) => {
    return value.filter((item) => item.isCorrect).length >= 1
  }),
})

type RoomResponsesType = z.infer<typeof RoomResponsesSchema>

type RoomResponsesProps = {
  submitAnswerChoices: (choices: string[]) => void
}

export function RoomResponses({ submitAnswerChoices }: RoomResponsesProps) {

  const { t } = useTranslation('global')
  const currentQuestion = useRoomContext(state => state.currentQuestion)
  const [isAutoSubmit, setAutoSubmit ] = useRoomContext(
    useShallow(state => [ state.isAutoSubmit, state.setAutoSubmit ])
  )

  const responses = currentQuestion.responses.map(r => ({ ...r, isCorrect : false }))
  const form = useForm<RoomResponsesType>({
    resolver: zodResolver(RoomResponsesSchema),
    values: { responses },
    mode: 'onChange'
  })

  const { control, getValues, formState: { isValid, isSubmitted }  } = form
  const choices = getValues().responses.filter(r => r.isCorrect).map(r => r.id)

  const { isAutoTrigger } = useAutoSubmit({
    isAutoSubmit,
    questionId: currentQuestion.questionId,
    choices,
    submitAnswerChoices
  })

  function onSubmit(data : RoomResponsesType) {
    submitAnswerChoices(
      data.responses
        .filter(r => r.isCorrect)
        .map(r =>  r.id)
    )
  }

  return (
    <Form {...form}>
      <form id="form-room-responses" onSubmit={form.handleSubmit(onSubmit)}>

        <div className="my-5 grid gap-4 md:grid-cols-2 md:gap-8">
          {responses.map((item, index) => (
            <div key={item.id} className="min-h-24 rounded-xl border bg-accent shadow-xs transition-colors hover:bg-primary/5 has-[input:checked]:bg-primary/5">

              <FormField
                control={control}
                name={`responses.${index}.isCorrect`}
                render={({ field }) => (
                  <FormItem className="size-full">
                    <FormControl className="size-full">
                      <div className="relative size-full">
                        <label className="flex size-full cursor-pointer items-center justify-start overflow-hidden" htmlFor={'qr-' + index}>
                          <span className="whitespace-break-spaces py-5 pl-5 pr-16">{item.text}</span>
                        </label>
                        <Checkbox id={'qr-' + index} onCheckedChange={field.onChange} disabled={isAutoTrigger} className="absolute right-5 top-2/4 mt-[-14px] size-7" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

            </div>
          ))}
        </div>

        <div className="m-auto flex flex-col items-center gap-4">
          {!isAutoSubmit &&
            <Button className="m-auto mt-4 block h-12 w-full sm:h-10 sm:w-36" type="submit" disabled={!isValid || isSubmitted || isAutoTrigger}>
              {t('Submit')}
            </Button>
          }

          <div className="flex items-center gap-2">
            <Switch id="auto-submit" checked={isAutoSubmit} onCheckedChange={setAutoSubmit} />
            <Label htmlFor="auto-submit" className={cn({
              'text-muted-foreground': !isAutoSubmit
            })}>Auto</Label>
          </div>
        </div>

      </form>
    </Form>
  )
}


