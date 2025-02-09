import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getSharingGroupsListQuery } from '@/queries/pages-queries'
import { translate } from '@/queries/utils-queries'
import { Group, Play } from 'lucide-react'
import Link from 'next/link'

export async function SharingGroupsList({ userId } : { userId: string}) {
  const { t } = await translate('global')
  const questionGroups = await getSharingGroupsListQuery(userId)

  if (questionGroups.length == 0) {
    return null
  }

  return (
    <>
      <h1 className="title">{t('SharingQuestions')}</h1>

      <div className="my-5 grid animate-fade-in gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {questionGroups.map((group) => (
          <Card className="q-card relative" key={group.id}>
            <CardHeader className="flex flex-row items-center pb-2 text-lg  font-bold">
              <div>
                <Group className="mr-2 size-8" />
              </div>
              <div>{group.name}</div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-xs">
                  Questions: <span className="text-second">{group.questionsCount}</span>
                </div>
                <div className="text-xs">
                  {t('Author')}: <span className="text-second">{group.author}</span>
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
              <div className="flex flex-wrap gap-4">
                <Link href={`/start/${group.id}`}>
                  <Button>
                    <Play className="mr-2 size-4" />
                    {group.roomInProgress ? t('Continue') : t('Start') }
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

      </div>
    </>
  )
}
