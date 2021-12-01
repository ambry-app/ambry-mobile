import TrackPlayer from 'react-native-track-player'

export default function run() {
  console.debug('SleepTimerTask: running sleep timer task')
  TrackPlayer.pause()
  return Promise.resolve()
}
