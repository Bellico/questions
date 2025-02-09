import { ActionResultType } from '@/actions/wrapper-actions'
import { useToast } from '@/components/ui/use-toast'
import { useAppStore } from '@/stores/app-store'
import { useEffect, useTransition } from 'react'

export function useAction(useAppLoader : boolean = true) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const setLoader = useAppStore((state) => state.setAppLoading)

  useEffect(() => {
    if (useAppLoader) setLoader(isPending)
    return () => setLoader(false)
  },[setLoader, isPending, useAppLoader])

  async function requestAction<T> (
    action:  () => Promise<ActionResultType<T>>,
    onSuccess: (data?:T) => void,
    successMessage?: string
  ) {
    startTransition(async () => {
      const result =  await action()

      if (result.success) {
        if (successMessage) {
          toast({
            variant: 'success',
            title: successMessage,
          })
        }

        onSuccess(result.data)
      } else {
        toast({
          variant: 'destructive',
          title: 'Something wrong!',
          description: result.message + (result.errors ? '' + JSON.stringify(result.errors) : ''),
        })
      }
    })
  }

  return requestAction
}

