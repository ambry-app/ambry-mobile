import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useRef } from 'react'

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
