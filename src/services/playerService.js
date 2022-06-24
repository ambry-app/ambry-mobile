import TrackPlayer, { Event } from 'react-native-track-player'
import { isPlaying } from '../lib/utils'
import { destroy, pause, play, seekRelative, stop } from '../stores/Player'

const REMOTE_JUMP_INTERVAL = 10

let wasPausedByDuck = false

export default async function setup() {
  const id = Date.now()
  console.debug('Service: setting up event listeners', id)

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    console.debug('Service: playback queue ended')

    stop()
  })

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    console.debug('Service: stop requested, destroying player')

    await pause()
    destroy()
  })

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.debug('Service: pausing')

    pause()
  })

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.debug('Service: playing')

    play()
  })

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, () => {
    console.debug('Service: jump backward', REMOTE_JUMP_INTERVAL)

    seekRelative(REMOTE_JUMP_INTERVAL * -1)
  })

  TrackPlayer.addEventListener(Event.RemoteJumpForward, () => {
    console.debug('Service: jump forward', REMOTE_JUMP_INTERVAL)

    seekRelative(REMOTE_JUMP_INTERVAL)
  })

  TrackPlayer.addEventListener(Event.RemoteDuck, async e => {
    const playerState = await TrackPlayer.getState()

    if (e.permanent === true && isPlaying(playerState)) {
      console.debug('Service: duck permanent, pausing')
      pause()
    } else {
      if (e.paused === true) {
        if (isPlaying(playerState)) {
          console.debug('Service: duck temporary, pausing')
          wasPausedByDuck = true
          pause()
        }
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
