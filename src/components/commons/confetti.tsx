'use client'

import { useConfetti } from '@/hooks/useConfetti'

export function Confetti () {
  const containerElRef = useConfetti()

  return (
    <div ref={containerElRef} className="absolute inset-0 overflow-hidden" style={{ 'perspective': '700px' }}></div>
  )
}
