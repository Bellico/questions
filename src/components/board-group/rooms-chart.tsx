'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts'

type RoomLineType ={
  score: number
}

export function RoomsChart({ data }: { data : RoomLineType[] }) {
  const { t } = useTranslation('global')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('ProgressResults')}</CardTitle>
        <CardDescription>
          {t('ProgressResultsDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-xs">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {t('Score')}
                          </span>
                          <span className="font-bold">
                            {payload[0].value}
                          </span>
                        </div>
                      </div>
                    )
                  }
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                strokeWidth={2}
                activeDot={{
                  r: 8,
                  style: { fill: 'hsl(var(--primary))' },
                }}
                style={
                  {
                    stroke: 'hsl(var(--primary))',
                  }
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
