import { useDrawerProgress, useDrawerStatus } from '@react-navigation/drawer'
import { useState } from 'react'
import {
  runOnJS,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated'

const THRESHOLD = 0.001

export function useEnhancedDrawerStatus() {
  const drawerStatus = useDrawerStatus()
  const [drawerDirection, setDrawerDirection] = useState(drawerStatus)
  const progress = useDrawerProgress()
  const previousValue = useSharedValue(0)

  useDerivedValue(() => {
    const oldValue = previousValue.value
    previousValue.value = progress.value

    if (progress.value - THRESHOLD < 0 || progress.value + THRESHOLD > 1) {
      runOnJS(setDrawerDirection)(drawerStatus)
    } else if (progress.value - oldValue > THRESHOLD) {
      runOnJS(setDrawerDirection)('opening')
    } else if (oldValue - progress.value > THRESHOLD) {
      runOnJS(setDrawerDirection)('closing')
    }
  }, [drawerStatus, progress, previousValue])

  return drawerDirection
}
