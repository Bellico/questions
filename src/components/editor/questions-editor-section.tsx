import { useQuestionsEditorContext } from '@/components/providers/questions-editor-provider'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useDebounce } from '@/hooks/useDebounce'
import { QuestionFormSchema, QuestionFormType, QuestionType } from '@/lib/schema'
import { numberToChar } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { MDXEditorMethods } from '@mdxeditor/editor'
import { Pencil, Trash2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

const QEditorMarkdown = dynamic(() => import('../mdx/mdx-markdown-editor'), {
  ssr: false
})

type QuestionsEditorSectionProps = {
  keyMap: string,
  indexQuestion: number,
  question: QuestionType
}

export function QuestionsEditorSection({
  keyMap,
  indexQuestion,
  question: { id, title, subject, responses }
}: QuestionsEditorSectionProps) {

  const canAutoAddResponse = useRef<boolean>(false)
  const qEditorMarkdownRef = useRef<MDXEditorMethods>(null)

  const { t } = useTranslation('editor')

  const [updateQuestion, removeStoreResponse] = useQuestionsEditorContext(
    useShallow((s) => [s.updateQuestion, s.removeResponse]),
  )

  const form = useForm<QuestionFormType>({
    resolver: zodResolver(QuestionFormSchema),
    values: { id, subject, responses, title: title || '' },
    mode: 'onBlur'
  })

  const { getValues, setValue, control, formState: { isValid } } = form

  const { fields: responseFields, append, remove } = useFieldArray({
    control,
    name: 'responses',
  })

  // EFFECT : Auto add new empty response
  useEffect(() => {
    if (!isValid) return
    if (!canAutoAddResponse.current) return

    if (responseFields.every(r => !!r.text)) {
      append({
        id: null,
        text: '',
        isCorrect: false
      }, {
        shouldFocus: false,
      })
    }
  }, [append, responseFields, isValid])

  // Sync markdown with form
  useEffect(() => {
    if (subject !== '')
      setValue('subject', subject, { shouldValidate: true })
  }, [setValue, subject])

  // Send new state values to store
  const updateQuestionDebounced = useDebounce((d) => {
    canAutoAddResponse.current = true
    const newValues = getValues()
    console.log(qEditorMarkdownRef.current?.getMarkdown()!)
    console.log(d)

    updateQuestion(keyMap, {
      title: newValues.title,
      subject: qEditorMarkdownRef.current?.getMarkdown()!,
      responses: newValues.responses.map(r => ({
        id: r.id,
        isCorrect: r.isCorrect,
        text: r.text
      }))
    })

  }, 500)

  // const qEditorMarkdownChange = useDebounce(() => {
  //   const value = qEditorMarkdownRef.current?.getMarkdown()
  //   if (value) setValue('subject', value, { shouldValidate: true })
  // }, 300)

  function addResponse() {
    append({
      id: null,
      text: '',
      isCorrect: false
    }, {
      shouldFocus: true,
    })
  }

  function removeResponse(index: number) {
    canAutoAddResponse.current = false

    const newValues = getValues()
    if (newValues.responses[index].text !== '') {
      removeStoreResponse(keyMap, index)
    } else {
      remove(index)
    }
  }

  return (
    <section className="min-h-[calc(100vh-75px)] bg-gray-100 dark:bg-accent">
      <div className="container">

        <Form {...form}>
          <form className="space-y-4" onChange={() => updateQuestionDebounced()}>

            {/* Title (index) */}
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem >
                  <FormControl>
                    <label className="relative mx-auto block xl:w-6/12">
                      <FormMessage className="text-center" />
                      <Pencil className="absolute right-3 top-1/2 size-5 -translate-y-1/2" />
                      <Input
                        className="mb-12 border-0 bg-transparent text-center text-2xl font-medium hover:ring-1 hover:ring-secondary sm:py-7 sm:text-5xl"
                        placeholder={'Question ' + indexQuestion}
                        type="text"
                        {...field}
                      />
                    </label>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={control}
              name="subject"
              render={() => (
                <FormItem className="w-full">
                  <FormControl>
                    {/* <Textarea className="min-h-[100px]" placeholder="Write your next question here..." {...field} /> */}
                    <QEditorMarkdown className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground"
                      markdown={subject}
                      ref={qEditorMarkdownRef}
                      onChange={updateQuestionDebounced}
                      placeholder={t('NextQuestion')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Responses */}
            {responseFields.map((item, index) => (
              <div key={index} className="w-full space-y-2">
                <FormLabel htmlFor={'qtext-' + indexQuestion + 'r-' + index}>{t('Response')} {index + 1}</FormLabel>
                <div className="flex items-center rounded-xl border p-2 has-[.bad]:bg-destructive/5 has-[.good]:bg-success/5">

                  <FormField
                    control={control}
                    name={`responses.${index}.isCorrect`}
                    render={({ field }) => (
                      // eslint-disable-next-line tailwindcss/no-custom-classname
                      <FormItem className={field.value ? 'good' : 'bad'}>
                        <FormControl>
                          <div className="mr-2 flex items-center space-x-2">
                            <Switch id={'q-' + indexQuestion + 'r-' + index} checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-success" name="isChecked" />
                            <Label htmlFor={'q-' + indexQuestion + 'r-' + index}>{field.value ? t('Good') : t('Bad')}</Label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`responses.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Textarea className="min-h-[90px]" id={'qtext-' + indexQuestion + 'r-' + index} placeholder={t('NextResponse') + ' ' + numberToChar(index)} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button variant="ghost" onClick={(e) => { e.preventDefault(); removeResponse(index) }} disabled={responseFields.filter(r => !!r.text).length <= 2}><Trash2 /></Button>
                </div>
              </div>
            ))}

          </form>
        </Form>

        <Button variant="link" onClick={addResponse} disabled={!isValid}>{t('AddResponse')}</Button>
      </div>
    </section>
  )
}
