import TrackPlayer, { Event, State } from 'react-native-track-player'
import SleepTimer from '../modules/SleepTimer'

import { play, pause, seekRelative, destroy } from '../stores/Player'

let wasPausedByDuck = false

export default async function setup() {
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    console.debug('Service: playback queue ended')

    SleepTimer.stop()
    seekRelative(0)
  })

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    console.debug('Service: stop requested, destroying player')

    SleepTimer.stop()
    await pause()
    destroy()
  })

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    console.debug('Service: pausing')

    SleepTimer.stop()
    pause()
  })

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.debug('Service: playing')

    play()
    SleepTimer.start()
  })

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, ({ interval }) => {
    console.debug('Service: jump backward', interval)

    seekRelative(interval * -1)
    SleepTimer.reset()
  })

  TrackPlayer.addEventListener(Event.RemoteJumpForward, ({ interval }) => {
    console.debug('Service: jump forward', interval)

    seekRelative(interval)
    SleepTimer.reset()
  })

  TrackPlayer.addEventListener(Event.RemoteDuck, async e => {
    if (e.permanent === true) {
      console.debug('Service: duck permanent, pausing')
      pause()
      SleepTimer.stop()
    } else {
      if (e.paused === true) {
        console.debug('Service: duck temporary, pausing')
        const playerState = await TrackPlayer.getState()
        wasPausedByDuck = playerState !== State.Paused
        await pause()
        await seekRelative(-1)
      } else {
        if (wasPausedByDuck === true) {
          console.debug('Service: duck resuming')
          play()
          wasPausedByDuck = false
        }
      }
    }
  })
}
