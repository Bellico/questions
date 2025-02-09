import { useEffect, useState } from 'react'

let memoryState: boolean = false
const listeners: Array<(state: boolean) => void> = []

export function dispatchLoader(newState: boolean) {
  if (newState != memoryState) {
    memoryState = newState
    listeners.forEach((listener) => {
      listener(newState)
    })
  }
}

export function useLoader() {
  const [state, setState] = useState<boolean>(memoryState)

  useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return { loading: state }
}

