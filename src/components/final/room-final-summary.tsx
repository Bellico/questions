import { RoomFinalRetry } from '@/components/final/room-final-retry'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { diffDateToDhms } from '@/lib/utils'
import { getRoomFinalScoreQuery } from '@/queries/pages-queries'
import { translate } from '@/queries/utils-queries'
import { Award, Calendar, CalendarFold, CheckCheck, History, XCircle } from 'lucide-react'

type RoomFinalSummaryProps = {
  roomId: string,
  shareLink?: string,
  canRetry: boolean
}

export async function RoomFinalSummary({ roomId, shareLink, canRetry } : RoomFinalSummaryProps) {
  const { t } = await translate('global')
  const stats = await getRoomFinalScoreQuery(roomId)

  return (
    <section className="container">
      <div className="mb-5 space-y-2">
        <h1 className="text-3xl font-bold">{t('AnswersSummary')}</h1>
        <p className="text-sm leading-none tracking-wide text-gray-500">Room #{roomId}</p>
        {canRetry && <RoomFinalRetry roomId={roomId} shareLink={shareLink} />}
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="p-0">
            <div className="flex items-center space-x-4 p-4">
              <Award className="size-6" />
              <div className="space-y-2">
                <CardTitle className="text-base font-semibold">{t('Score')}</CardTitle>
                <CardDescription className="text-sm leading-none">{stats.score}%</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-0">
            <div className="flex items-center space-x-4 p-4">
              <CheckCheck className="size-6" />
              <div className="space-y-2">
                <CardTitle className="text-base font-semibold">{t('Success')}</CardTitle>
                <CardDescription className="text-sm leading-none">{stats.success}/{stats.count}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-0">
            <div className="flex items-center space-x-4 p-4">
              <XCircle className="size-6" />
              <div className="space-y-2">
                <CardTitle className="text-base font-semibold">{t('Failed')}</CardTitle>
                <CardDescription className="text-sm leading-none">{stats.failed}/{stats.count}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Card className="flex-1">
            <CardHeader className="p-0">
              <div className="flex items-center space-x-4 p-4">
                <Calendar className="size-6" />
                <div className="space-y-2">
                  <CardTitle className="text-base font-semibold">{t('DateStart')}</CardTitle>
                  <CardDescription className="text-sm leading-none">{stats.dateStart?.toLocaleString('fr-fr')}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="flex-1">
            <CardHeader className="p-0">
              <div className="flex items-center space-x-4 p-4">
                <CalendarFold className="size-6" />
                <div className="space-y-2">
                  <CardTitle className="text-base font-semibold">{t('DateEnd')}</CardTitle>
                  <CardDescription className="text-sm leading-none">{stats.dateEnd?.toLocaleString('fr-fr')}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="flex-1">
            <CardHeader className="p-0">
              <div className="flex items-center space-x-4 p-4">
                <History className="size-6" />
                <div className="space-y-2">
                  <CardTitle className="text-base font-semibold">{t('Duration')}</CardTitle>
                  <CardDescription className="text-sm leading-none">{diffDateToDhms(stats.dateStart!, stats.dateEnd!, t)}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

      </div>
    </section>
  )
}
