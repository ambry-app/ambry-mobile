import TrackPlayer, { Event, State } from 'react-native-track-player'
import { destroy, pause, play, seekRelative } from '../stores/Player'

let wasPausedByDuck = false

// This is a hack to work around a bug in track player:
// Event listeners are NOT cleared when the player is destroyed. So we only fire
// the listeners when the timecode of last setup matches.
let validId

export default async function setup() {
  const id = Date.now()
  validId = id
  console.debug('Service: setting up event listeners', id)

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    if (id !== validId) {
      return
    }
    console.debug('Service: playback queue ended')

    seekRelative(0)
  })

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    if (id !== validId) {
      return
    }
    console.debug('Service: stop requested, destroying player')

    await pause()
    destroy()
  })

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    if (id !== validId) {
      return
    }
    console.debug('Service: pausing')

    pause()
  })

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    if (id !== validId) {
      return
    }
    console.debug('Service: playing')

    play()
  })

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, ({ interval }) => {
    if (id !== validId) {
      return
    }
    console.debug('Service: jump backward', interval)

    seekRelative(interval * -1)
  })

  TrackPlayer.addEventListener(Event.RemoteJumpForward, ({ interval }) => {
    if (id !== validId) {
      return
    }
    console.debug('Service: jump forward', interval)

    seekRelative(interval)
  })

  TrackPlayer.addEventListener(Event.RemoteDuck, async e => {
    if (id !== validId) {
      return
    }
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
