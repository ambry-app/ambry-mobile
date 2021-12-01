import AsyncStorage from '@react-native-async-storage/async-storage'
import { NativeModules } from 'react-native'

const { SleepTimerModule } = NativeModules

const SLEEP_TIMER_KEY = '@Ambry_sleepTimer'
const DEFAULT_COUNTDOWN_SECONDS = 600

const defaultSettings = {
  enabled: false,
  countdownSeconds: DEFAULT_COUNTDOWN_SECONDS,
  targetTime: null
}

const get = async () => {
  const timer = await AsyncStorage.getItem(SLEEP_TIMER_KEY)

  if (timer) {
    return JSON.parse(timer)
  } else {
    return defaultSettings
  }
}

const set = timer => {
  AsyncStorage.setItem(SLEEP_TIMER_KEY, JSON.stringify(timer))

  return timer
}

const toggleEnabled = async (alsoStart = false) => {
  let timer = await get()

  timer = set({ ...timer, enabled: !timer.enabled })

  if (timer.enabled) {
    console.debug('SleepTimer: enabled')

    if (alsoStart) {
      timer = await start()
    }
  } else {
    console.debug('SleepTimer: disabled')

    if (timer.targetTime) {
      timer = await stop()
    }
  }

  return timer
}

const setCountdown = async seconds => {
  const timer = await get()

  console.debug('SleepTimer: setting countdown to ' + seconds + ' seconds')

  return set({ ...timer, countdownSeconds: seconds })
}

const start = async () => {
  const timer = await get()

  if (timer.enabled) {
    const targetTime = Date.now() + timer.countdownSeconds * 1000

    console.debug('SleepTimer: starting timer')
    SleepTimerModule.setSleepTimer(timer.countdownSeconds)

    return set({ ...timer, targetTime })
  } else {
    console.debug("SleepTimer: not starting timer, because it's disabled")

    return timer
  }
}

const reset = () => {
  console.debug('SleepTimer: resetting timer')

  return start()
}

const stop = async () => {
  const timer = await get()

  console.debug('SleepTimer: stopping timer')
  SleepTimerModule.cancelSleepTimer()

  return set({ ...timer, targetTime: null })
}

export default { get, toggleEnabled, setCountdown, start, reset, stop }
