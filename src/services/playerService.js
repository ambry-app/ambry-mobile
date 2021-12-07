import EncryptedStorage from 'react-native-encrypted-storage'
import TrackPlayer, { Event, State } from 'react-native-track-player'
import { reportPlayerState } from '../api/ambry'
import SleepTimer from '../modules/SleepTimer'

import { AUTH_STORAGE_KEY } from '../stores/AmbryAPI'

let wasPausedByDuck = false

const updateServerPosition = async () => {
  const [position, track, storeData] = await Promise.all([
    TrackPlayer.getPosition(),
    TrackPlayer.getTrack(0),
    EncryptedStorage.getItem(AUTH_STORAGE_KEY)
  ])
  const authData = JSON.parse(storeData).state._authData

  if (!track) {
    console.warn('Service: updateServerPosition called while no track loaded')
    return
  }

  const playerStateID = track.description

  const playerStateReport = {
    id: playerStateID,
    position: position.toString()
  }

  console.debug('Service: updating server position', playerStateReport)
  reportPlayerState(authData, playerStateReport)
}

const seekRelative = async interval => {
  console.debug('Service: seeking', interval)

  const [position, duration, playbackRate] = await Promise.all([
    TrackPlayer.getPosition(),
    TrackPlayer.getDuration(),
    TrackPlayer.getRate()
  ])
  const actualInterval = interval * playbackRate
  const targetDestination = position + actualInterval
  const actualDestination = Math.max(Math.min(targetDestination, duration), 0)

  await TrackPlayer.seekTo(actualDestination)

  updateServerPosition()
}

export default async function setup() {
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    console.debug('Service: playback queue ended')

    SleepTimer.stop()
    updateServerPosition()
  })

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    console.debug('Service: stop requested, destroying player')

    SleepTimer.stop()
    await TrackPlayer.pause()
    await seekRelative(-1)
    TrackPlayer.destroy()
  })

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    console.debug('Service: pausing')

    SleepTimer.stop()
    await TrackPlayer.pause()
    seekRelative(-1)
  })

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.debug('Service: playing')

    TrackPlayer.play()
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
      TrackPlayer.pause()
      SleepTimer.stop()
    } else {
      if (e.paused === true) {
        console.debug('Service: duck temporary, pausing')
        const playerState = await TrackPlayer.getState()
        wasPausedByDuck = playerState !== State.Paused
        await TrackPlayer.pause()
        await seekRelative(-1)
      } else {
        if (wasPausedByDuck === true) {
          console.debug('Service: duck resuming')
          TrackPlayer.play()
          wasPausedByDuck = false
        }
      }
    }
  })
}
