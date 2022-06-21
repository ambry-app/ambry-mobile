import { pause } from '../stores/Player'
import { useSleepTimer } from '../stores/SleepTimer'

export default async function run() {
  console.debug('SleepTimerTask: sleep timer triggered')

  const timer = useSleepTimer.getState()

  if (!timer.enabled) {
    console.debug('SleepTimerTask: canceled')
    return
  }

  await pause()
}
