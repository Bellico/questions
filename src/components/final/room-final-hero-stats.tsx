import { getRoomFinalScoreQuery } from '@/queries/pages-queries'
import { translate } from '@/queries/utils-queries'

export async function RoomFinalHeroStats({ roomId } : { roomId: string}) {

  const { t } = await translate('global')
  const stats = await getRoomFinalScoreQuery(roomId)

  return (
    <div className="space-y-3 text-xl sm:space-y-5 sm:text-3xl">
      <div className="animate-fade-in opacity-0 delay-500">{t('Score')} {stats.score}%</div>
      <div className="animate-fade-in opacity-0 delay-700">{t('Success')} {stats.success}/{stats.count}</div>
      <div className="animate-fade-in opacity-0 delay-1000">{t('Failed')} {stats.failed}/{stats.count}</div>
    </div>
  )
}
