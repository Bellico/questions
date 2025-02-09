'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export default function Template({
  groupboard,
  groupstats,
}: {
  children: ReactNode
  groupboard: ReactNode
  groupstats: ReactNode
}) {
  return (
    <>
      <motion.div
        className="min-h-[354px] bg-accent shadow-md"
        initial={{ height: 'auto' }}
        animate={{ height: 'calc(100vh - 65px)' }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeInOut' }}
      >
        {groupstats}

        <motion.div
          initial={{ display: 'none', opacity: 0 }}
          animate={{ display: 'block', opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeInOut' }}
        >
          {groupboard}
        </motion.div>

      </motion.div>
    </>
  )
}
