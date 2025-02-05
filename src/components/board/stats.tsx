import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { secondsToDhms } from '@/lib/utils'
import { getGroupStatsQuery, getStatsQuery } from '@/queries/pages-queries'
import { translate } from '@/queries/utils-queries'
import { Award, BoxIcon, History, XCircle } from 'lucide-react'

export const BoardStats = async ({ userId, groupId } : { userId: string , groupId?: string}) => {
  const { t } = await translate('global')

  const stats = groupId ?
    await getGroupStatsQuery(userId, groupId) :
    await getStatsQuery(userId)

  return (
    <div className="my-5 grid animate-fade-in grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('Questions')}
          </CardTitle>
          <BoxIcon className="size-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.questionCount > 0 ? stats.questionCount : '...'}</div>
          {stats.groupCount > 1 && <p className="text-second text-xs">{stats.groupCount} {t('Groups')}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('Score')}
          </CardTitle>
          <Award className="size-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.avgScore !== null ? stats.avgScore + ' %' : '...'}</div>
          { stats.roomCount > 0 &&
            <p className="text-second text-xs">{stats.roomCount} {t('Ratings')}</p>
          }
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('Failed')}</CardTitle>
          <XCircle className="size-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.answerCount > 0 ? stats.answerFailedCount : '...'}</div>
          {stats.answerCount > 0 && <p className="text-second text-xs">{stats.answerCount} {t('Answers')}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('AverageTime')}</CardTitle>
          <History className="size-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary"> {stats.avgAnwserTime > 0 ? secondsToDhms(stats.avgAnwserTime, t) : '...'}</div>
          {stats.totalTime > 0 && <p className="text-second text-xs">{secondsToDhms(stats.totalTime, t)} {t('TotalTime')}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
