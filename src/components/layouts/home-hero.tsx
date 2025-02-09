'use client'

import SubscribeForm from '@/components/auth/subscribe-form'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const show_time = (delay : number)  => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: {  ease: 'easeOut', duration: 0.3, delay: delay },
  viewport: { once: true },
})

export const HomeHero = () => {
  const { t } = useTranslation('global')

  return (
    <section className="h-screen w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container flex h-full items-center justify-center px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <motion.h1 {...show_time(0)} className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              {t('Home.Title')}
            </motion.h1>
            <motion.p {...show_time(0.1)} className="text-second mx-auto max-w-[700px] md:text-xl">
              {t('Home.Text')}
            </motion.p>
          </div>
          <motion.div {...show_time(0.2)} className="w-full max-w-sm space-y-2 lg:max-w-[29rem]">
            <SubscribeForm />
            <p className="text-second text-xs">
              {t('Home.HelpText')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
