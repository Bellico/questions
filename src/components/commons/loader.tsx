'use client'

import { OverloadSpinner } from '@/components/commons/spinner'
import { useAppStore } from '@/stores/app-store'

export function Loader() {
  const isAppLoading = useAppStore((state) => state.isAppLoading)

  if (isAppLoading)
    return <OverloadSpinner />
  else
    return null
}
