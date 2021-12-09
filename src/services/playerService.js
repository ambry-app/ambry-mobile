import TrackPlayer, { Event, State } from 'react-native-track-player'

import { play, pause, seekRelative, destroy } from '../stores/Player'

let wasPausedByDuck = false

export default async function setup() {
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    console.debug('Service: playback queue ended')

    seekRelative(0)
  })

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    console.debug('Service: stop requested, destroying player')

    await pause()
    destroy()
  })

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    console.debug('Service: pausing')

    pause()
  })

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.debug('Service: playing')

    play()
  })

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, ({ interval }) => {
    console.debug('Service: jump backward', interval)

    seekRelative(interval * -1)
  })

  TrackPlayer.addEventListener(Event.RemoteJumpForward, ({ interval }) => {
    console.debug('Service: jump forward', interval)

    seekRelative(interval)
  })

  TrackPlayer.addEventListener(Event.RemoteDuck, async e => {
    if (e.permanent === true) {
      console.debug('Service: duck permanent, pausing')
      pause()
    } else {
      if (e.paused === true) {
        console.debug('Service: duck temporary, pausing')
        const playerState = await TrackPlayer.getState()
        wasPausedByDuck = playerState !== State.Paused
        await pause()
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
