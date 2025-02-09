import { QuestionsEditorAccordionHeader } from '@/components/editor/questions-editor-accordion-header'
import { QuestionsEditorSection } from '@/components/editor/questions-editor-section'
import { useQuestionsEditorContext } from '@/components/providers/questions-editor-provider'
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { useAccordion } from '@/hooks/useAccordion'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function QuestionsEditorAccordion() {

  const { t } = useTranslation(['global', 'editor'])

  const questionsMap = useQuestionsEditorContext(state => state.questionsMap)
  const lastQuestionAdded = useQuestionsEditorContext(state => state.lastQuestionAdded)
  const addNewQuestion = useQuestionsEditorContext(state => state.addQuestion)
  const removeQuestion = useQuestionsEditorContext(state => state.removeQuestion)
  const changeOrder = useQuestionsEditorContext(state => state.changeOrder)

  const [accordionState, toggleExpand, expandAll, collapseAll] = useAccordion(questionsMap, lastQuestionAdded)

  function dragEndEvent(e: DragEndEvent) {
    const { active, over } = e
    if (over && active.id !== over.id)  changeOrder(active.id as string, over.id as string)
  }

  let index = 1
  return (
    <>
      <Accordion type="multiple" value={accordionState}>
        <DndContext onDragEnd={dragEndEvent} >

          <SortableContext
            items={[...questionsMap].map(([key]) => key)}
            strategy={verticalListSortingStrategy}
          >
            {[...questionsMap].map(([key, value]) => (

              <AccordionItem key={key} id={'q-' + key} value={key}>
                <QuestionsEditorAccordionHeader keyMap={key} title={value.title} index={index} responseCount={value.responses.length}>
                  {questionsMap.size > 1 && <Button className="mr-2 text-xs md:text-sm" variant="destructive" onClick={() => removeQuestion(key)}>{t('Remove')}</Button>}
                  <Button className="mr-2 text-xs md:text-sm" variant="outline" onClick={() => toggleExpand(key)}>{accordionState.includes(key) ? t('Hide') : t('Show')}</Button>
                  <Button className="mr-2 hidden md:inline" variant="ghost" onClick={() => expandAll()}><ChevronsUpDown className="size-3" /></Button>
                  <Button variant="ghost" onClick={() => collapseAll()}><ChevronsDownUp className="size-3" /></Button>
                </QuestionsEditorAccordionHeader>

                <AccordionContent>
                  <QuestionsEditorSection keyMap={key} indexQuestion={index++} question={value} />
                </AccordionContent>
              </AccordionItem>

            ))}
          </SortableContext>

        </DndContext>
      </Accordion>

      <Button variant="secondary" size="lg" onClick={() => addNewQuestion()} className="w-full">
        {t('AddQuestion', { ns: 'editor' } )}
      </Button>
    </>
  )
}
