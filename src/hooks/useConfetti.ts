import { useEffect, useRef } from 'react'

const confettiColors = ['#EF2964', '#00C09D', '#2D87B0', '#48485E','#EFFF1D']
const confettiAnimations = ['slow', 'medium', 'fast']

function createConfettiElement(offsetWidth: number) {
  const confettiEl = globalThis.document.createElement('div')
  const confettiSize = (Math.floor(Math.random() * 3) + 7) + 'px'
  const confettiBackground = confettiColors[Math.floor(Math.random() * confettiColors.length)]
  const confettiLeft = (Math.floor(Math.random() * offsetWidth)) + 'px'
  const confettiAnimation = confettiAnimations[Math.floor(Math.random() * confettiAnimations.length)]

  confettiEl.classList.add('confetti', 'confetti--animation-' + confettiAnimation)
  confettiEl.style.left = confettiLeft
  confettiEl.style.width = confettiSize
  confettiEl.style.height = confettiSize
  confettiEl.style.backgroundColor = confettiBackground

  return confettiEl
}

export const useConfetti = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const confettiInterval = setInterval(() => {
      if (!containerRef.current) return

      const confettiEl = createConfettiElement(containerRef.current.offsetWidth!)

      setTimeout(function() {
        if (containerRef.current) containerRef.current.removeChild(confettiEl)
      }, 3000)

      containerRef.current.appendChild(confettiEl)
    }, 25)

    return (() => {
      clearInterval(confettiInterval)
    })
  },[])

  return containerRef
}
