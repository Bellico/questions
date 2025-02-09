'use client'

import { QEditorIcon } from '@/components/commons/q-editor-icon'
import { motion, useScroll, useTransform } from 'framer-motion'

const show_time = (delay : number)  => ({
  initial: { opacity: 0, y: 140 },
  whileInView: { opacity: 1, y: 0 },
  transition: {  ease: 'easeIn', duration: 0.3, delay: delay }, //repeat: Infinity, repeatType: 'reverse'
  viewport: { once: false },
})

const levitation ={
  initial: {  scale: 1 },
  whileInView: { scale : 1.5 },
  transition: { ease: 'linear', duration: 1.5, repeat: Infinity, repeatType: 'reverse' as const },
  viewport: { once: true },
}

export const HomeFeatures = () => {
  const { scrollYProgress } = useScroll()
  const scale = useTransform(scrollYProgress, [0.02, 0.17], [4, 1])
  const opacity = useTransform(scrollYProgress, [0.10, 0.17], [0, 0.5])
  const translateY = useTransform(scrollYProgress, [0.02, 0.17], [1000, 0])

  return (
    <>
      <section className="relative h-screen py-20">
        <div className="container max-w-(--breakpoint-2xl) space-y-28">
          <motion.div style={{ scale, translateY }} className="sticky flex items-center justify-center">
            <motion.div {...levitation} style={{ opacity }}  className="absolute -z-10 aspect-square w-[700px] origin-center rounded-full bg-primary blur-[60px]"></motion.div>
            <QEditorIcon colored className="size-[30rem] drop-shadow-q-editor-icon" />
          </motion.div>
          <motion.div style={{ translateY }} {...show_time(0.3)} className="relative space-y-6 px-4 text-center">
            <h2 className="text-5xl font-extrabold tracking-wide">Build your dream site. No compromises.</h2>
            <p className="text-xl tracking-wider">
              A web tool for all to explore, provide insight, scrutinize, and delegate — in any web browser and device.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-(--breakpoint-2xl) px-[64px] py-[120px]">
          <div className="flex gap-20">
            <motion.div {...show_time(0)} className="flex-1 space-y-6">
              <h2 className="text-5xl font-extrabold tracking-wide">Enhanced Customer Engagement</h2>
              <p className="text-xl tracking-wider">
              At AppoText, we elevate customer engagement through personalized interactions that drive action, nurturing lasting relationships and fostering loyalty.
              </p>
            </motion.div>
            <motion.div {...show_time(0.2)} className="flex-1">
              <div className="h-[640px] w-[620px] rounded-3xl bg-gray-400"></div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-(--breakpoint-2xl) px-[64px] py-[120px]">
          <div className="flex gap-20">
            <motion.div {...show_time(0)} className="flex-1">
              <div className="h-[640px] w-[620px] rounded-3xl bg-gray-400"></div>
            </motion.div>
            <motion.div {...show_time(0.2)} className="flex-1 space-y-6">
              <h2 className="text-5xl font-extrabold tracking-wide">Enhanced Customer Engagement</h2>
              <p className="text-xl tracking-wider">
              At AppoText, we elevate customer engagement through personalized interactions that drive action, nurturing lasting relationships and fostering loyalty.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-(--breakpoint-2xl) px-[64px] py-[120px]">
          <div className="flex flex-col items-center gap-20">
            <motion.div {...show_time(0)} className="space-y-6 text-center">
              <h2 className="text-5xl font-extrabold tracking-wide">Build your dream site. No compromises.</h2>
              <p className="text-xl tracking-wider">
              A web tool for all to explore, provide insight, scrutinize, and delegate — in any web browser and device.
              </p>
            </motion.div>
            <motion.div {...show_time(0.2)} className="">
              <div className="h-[640px] w-[620px] rounded-3xl bg-gray-400"></div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="d:py-14 bg-[#ffa197] dark:bg-accent lg:py-32 xl:py-48">
        <div className="container">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
        Our Features
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">Write your own</span>
            <QEditorIcon colored className="size-32" />
            <span className="text-2xl">uestions</span>
          </div>
        </div>
      </section>
    </>
  )
}
