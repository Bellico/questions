import { cn } from '@/lib/utils'

export const Spinner = ({ className } : { className? : string}) => {
  return (
    <div className={cn(className, 'flex items-center justify-center')}>
      <span className="spinner"></span>
    </div>
  )
}

export const OverloadSpinner = ({ overloadPage } : { overloadPage? : boolean}) => {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-100/75 dark:bg-black/75">
      <span className={cn('spinner', { 'page-spinner': overloadPage ?? true})}></span>
    </div>
  )
}

export const MainSpinner = () => {
  return (
    <main className="absolute inset-0 z-50 flex items-center justify-center">
      <span className="spinner page-spinner"></span>
    </main>
  )
}
