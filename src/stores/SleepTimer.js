import AsyncStorage from '@react-native-async-storage/async-storage'
import { NativeModules } from 'react-native'
import create from 'zustand'
import { persist } from 'zustand/middleware'

const { SleepTimerModule } = NativeModules

const SLEEP_TIMER_STORAGE_KEY = '@Ambry_sleepTimer'
const DEFAULT_COUNTDOWN_SECONDS = 600

// task timeout is 45 seconds, so we need to stay under that
export const FADE_TIME = 30

// Store:

const useStore = create(
  persist(
    () => ({
      enabled: false,
      countdownSeconds: DEFAULT_COUNTDOWN_SECONDS,
      isRunning: false,
      targetTime: null,
      _hasHydrated: false
    }),
    {
      name: SLEEP_TIMER_STORAGE_KEY,
      getStorage: () => AsyncStorage,
      // only persist these values:
      partialize: state => ({
        enabled: state.enabled,
        countdownSeconds: state.countdownSeconds,
        targetTime: state.targetTime
      }),
      onRehydrateStorage: _initialState => {
        console.debug('SleepTimer: Hydrating')

        return (_state, error) => {
          if (error) {
            console.error(
              'SleepTimer: An error happened during hydration',
              error
            )
          } else {
            useStore.setState({ _hasHydrated: true })
            console.debug('SleepTimer: Hydration finished')
          }
        }
      }
    }
  )
)

export const useSleepTimer = useStore

// Actions:

const toggleEnabled = (alsoStart = false) => {
  const timer = useStore.getState()
  const enabled = !timer.enabled

  useStore.setState({ enabled })

  if (enabled) {
    console.debug('SleepTimer: enabled')

    if (alsoStart) {
      start()
    }
  } else {
    console.debug('SleepTimer: disabled')

    stopIfRunning()
  }
}

const setCountdown = countdownSeconds => {
  console.debug(
    'SleepTimer: setting countdown to ' + countdownSeconds + ' seconds'
  )

  useStore.setState({ countdownSeconds })

  resetIfRunning()
}

const start = () => {
  const timer = useStore.getState()
  const targetTime = Date.now() + timer.countdownSeconds * 1000

  console.debug('SleepTimer: starting timer')
  SleepTimerModule.setSleepTimer(timer.countdownSeconds - FADE_TIME)

  useStore.setState({ targetTime, isRunning: true })
}

const startIfEnabled = () => {
  const timer = useStore.getState()

  if (timer.enabled) {
    start()
  }
}

const resetIfRunning = () => {
  const timer = useStore.getState()

  if (timer.enabled && timer.targetTime) {
    console.debug('SleepTimer: resetting timer')

    start()
  }
}

const stopIfRunning = () => {
  const timer = useStore.getState()

  if (timer.targetTime) {
    console.debug('SleepTimer: stopping timer')
    SleepTimerModule.cancelSleepTimer()
    useStore.setState({ targetTime: null, isRunning: false })
  }
}

export default {
  toggleEnabled,
  setCountdown,
  startIfEnabled,
  resetIfRunning,
  stopIfRunning
}
