import { useCallback, useRef } from 'react'
import { useFocusEffect } from '@react-navigation/native'

export function useRefreshOnFocus(refetch) {
  const firstTimeRef = useRef(true)

  useFocusEffect(
    useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false
        return
      }

      refetch()
    }, [refetch])
  )
}
