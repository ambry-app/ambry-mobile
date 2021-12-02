import TrackPlayer from 'react-native-track-player'

// task timeout is 30 seconds, so we need to stay under that

const FADE_TIME = 25 // seconds
const INTERVAL = 500 // milliseconds
const STEPS = (1000 / INTERVAL) * FADE_TIME

export default function run() {
  console.debug('SleepTimerTask: running sleep timer task')

  return new Promise((resolve, reject) => {
    let currentStep = STEPS

    const interval = setInterval(() => {
      console.log(currentStep)

      if (currentStep > 0) {
        TrackPlayer.setVolume(currentStep / STEPS)
        currentStep -= 1
      } else {
        console.log('done')
        clearInterval(interval)
        TrackPlayer.pause()
        TrackPlayer.setVolume(1)
        resolve()
      }
    }, INTERVAL)
  })
}
