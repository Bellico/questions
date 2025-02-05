'use client'

import { OverloadSpinner } from '@/components/commons/spinner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'
import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

type DrawerDialogProps = {
  dialogId: string,
  title: string,
  description?: string
  className?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trigger: any
}

export function DrawerDialog({ dialogId, trigger, title, description, className, children }: PropsWithChildren<DrawerDialogProps>) {
  const { t } = useTranslation('global')
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const [open, setDialogOpen, isDialogLoading ] = useAppStore(
    useShallow((s) => [s.dialogOpen(dialogId), s.setDialogOpen, s.isDialogLoading])
  )

  if (isDesktop) {
    return (
      <>
        <Dialog open={open} onOpenChange={(isOpen => setDialogOpen(dialogId, isOpen))}>
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
          <DialogContent className={cn('max-w-(--breakpoint-sm)', className)}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description &&
               <DialogDescription>
                 {description}
               </DialogDescription>
              }
            </DialogHeader>
            {children}
            {isDialogLoading && <OverloadSpinner overloadPage={false} />}
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <Drawer open={open} onOpenChange={(isOpen => setDialogOpen(dialogId, isOpen))}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4" >
          {children}
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">{t('Cancel')}</Button>
          </DrawerClose>
        </DrawerFooter>
        {isDialogLoading && <OverloadSpinner overloadPage={false} />}
      </DrawerContent>
    </Drawer>
  )
}
