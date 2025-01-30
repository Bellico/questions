import { RoomState, RoomStateProps, createRoomStore } from '@/stores/room-store'
import { PropsWithChildren, createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand'

type RoomStore = ReturnType<typeof createRoomStore>

const RoomContext = createContext<RoomStore | null>(null)

export function useRoomContext<T>(selector: (state: RoomState) => T): T {
  const store = useContext(RoomContext)

  if (!store) throw new Error('Missing Provider in the tree')

  return useStore(store, selector)
}

export function RoomProvider({ value, children }: PropsWithChildren<{ value: RoomStateProps }>) {
  const storeRef = useRef<RoomStore>(null)
  storeRef.current = createRoomStore(value)

  return (
    <RoomContext.Provider value={storeRef.current}>
      {children}
    </RoomContext.Provider>
  )
}
