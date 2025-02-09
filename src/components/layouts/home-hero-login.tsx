'use client'

import LoginForm from '@/components/auth/login-form'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const show_time = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: {  ease: 'easeOut', duration: 0.3 },
  viewport: { once: true },
}

export const HomeHeroLogin = ({ email } : { email: string }) => {
  const { t } = useTranslation('global')

  return (
    <section className="h-screen w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container flex h-full items-center justify-center px-4 md:px-6">
        <motion.div {...show_time} className="flex flex-col items-center space-y-4 text-center">

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              {t('Home.Title')}
            </h1>
            <p className="text-second">
              {t('Home.EnterPassword')}
            </p>
          </div>

          <LoginForm email={email} />

        </motion.div>
      </div>
    </section>
  )
}
