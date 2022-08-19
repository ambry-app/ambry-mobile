import { useDrawerProgress } from '@react-navigation/drawer'
import { useState } from 'react'
import {
  runOnJS,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated'

const THRESHOLD = 0.005

export function useDrawerDirection() {
  const [drawerDirection, setDrawerDirection] = useState(0)

  const progress = useDrawerProgress()
  const previousValue = useSharedValue(0)

  useDerivedValue(() => {
    const oldValue = previousValue.value
    previousValue.value = progress.value

    if (progress.value - oldValue > THRESHOLD) {
      runOnJS(setDrawerDirection)(1)
    } else if (oldValue - progress.value > THRESHOLD) {
      runOnJS(setDrawerDirection)(-1)
    }
  }, [progress, previousValue])

  return drawerDirection
}
