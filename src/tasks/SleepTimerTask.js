import TrackPlayer from 'react-native-track-player'
import SleepTimer, { FADE_TIME } from '../modules/SleepTimer'

const INTERVAL = 500 // milliseconds
const STEPS = (1000 / INTERVAL) * FADE_TIME

export default async function run() {
  console.debug('SleepTimerTask: sleep timer fade started')

  const { targetTime } = await SleepTimer.get()

  return new Promise((resolve, reject) => {
    let currentStep = STEPS

    const interval = setInterval(async () => {
      const timer = await SleepTimer.get()

      // if the timer is no longer enabled or the target time has changed since
      // we started running
      if (!timer.enabled || timer.targetTime !== targetTime) {
        console.debug('SleepTimerTask: fade canceled')

        await TrackPlayer.setVolume(1)
        clearInterval(interval)
        return resolve()
      }

      if (currentStep > 0) {
        TrackPlayer.setVolume(currentStep / STEPS)
        currentStep -= 1
      } else {
        console.debug('SleepTimerTask: fade finished')

        clearInterval(interval)
        await Promise.all([TrackPlayer.pause(), TrackPlayer.setVolume(1)])
        resolve()
      }
    }, INTERVAL)
  })
}
