import { QuestionGroupNew } from '@/components/board/question-group-new'
import { QuestionGroupsListActions } from '@/components/board/question-groups-list-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getGroupsListQuery } from '@/queries/pages-queries'
import { translate } from '@/queries/utils-queries'
import { BarChart3, Group, MoreHorizontal, Pencil, Play, Plus, Users } from 'lucide-react'
import Link from 'next/link'

export async function QuestionGroupsList({userId} : { userId: string}) {
  const { t } = await translate('global')
  const questionGroups = await getGroupsListQuery(userId)

  if (questionGroups.length == 0) {
    return(
      <QuestionGroupNew>
        <span>{t('AddFirst')}</span>
      </QuestionGroupNew>
    )
  }

  return (
    <div className="my-5 grid animate-fade-in gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {questionGroups.map((group) => (
        <Card className="q-card relative" key={group.id}>
          <CardHeader className="flex flex-row items-center pb-2 text-lg  font-bold">
            <div>
              <Group className="mr-2 size-8" />
            </div>
            <div className="flex">
              <div>{group.name}</div>
              <div className="ml-1 text-xs">(v{group.version})</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-xs">
                Questions: <span className="text-second">{group.questionsCount}</span>
              </div>
              {group.roomInProgress &&
                 <div className="text-xs ">
                   {t('Last')}: <span className="font-bold text-primary">{t('Progress')}</span>
                 </div>
              }
              {!group.roomInProgress && group.lastScore !== null &&
                <div className="text-xs">
                  {t('Last')}: <span className="font-bold text-primary">{group.lastScore}%</span>
                  <span className="text-second"> - {group.lastTryDate?.toLocaleString('fr-fr')}</span>
                </div>
              }
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4">
              {/* Not use next link for cache trouble */}
              <a href={`/start/${group.id}`}>
                <Button>
                  <Play className="mr-2 size-4" />
                  {group.roomInProgress ? t('Continue') : t('Start') }
                </Button>
              </a>

              <Link href={`/editor/${group.id}`}>
                <Button variant="secondary">
                  <Pencil className="mr-2 size-4" />
                  {t('Edit')}
                </Button>
              </Link>

              {group.resultsCount > 0 &&
                <Link href={`/board/${group.id}`}>
                  <Button variant="secondary">
                    <BarChart3 className="mr-2 size-4" />
                    {t('Results')} ({group.resultsCount})
                  </Button>
                </Link>
              }
            </div>

            <div className="absolute right-6 top-6 flex items-center gap-2">
              {group.isShared && <Users className="text-second"/>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="size-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal  className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <QuestionGroupsListActions groupId={group.id} roomInProgress={group.roomInProgress} />
              </DropdownMenu>
            </div>

          </CardContent>
        </Card>
      ))}

      <QuestionGroupNew>
        <Plus className="size-10" />
      </QuestionGroupNew>
    </div>
  )
}
