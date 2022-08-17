import { useEffect, useRef } from 'react'
import { useDrawerStatus } from '@react-navigation/drawer'

export function useRefreshOnDrawerOpen(refetch) {
  const firstTimeRef = useRef(true)

  const drawerStatus = useDrawerStatus()

  useEffect(() => {
    if (drawerStatus === 'closed') {
      return
    }

    if (firstTimeRef.current) {
      firstTimeRef.current = false
      return
    }

    refetch()
  }, [drawerStatus, refetch])
}
