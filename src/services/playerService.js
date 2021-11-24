import EncryptedStorage from 'react-native-encrypted-storage'
import TrackPlayer, { Event, State } from 'react-native-track-player'
import { reportPlayerState } from '../api/ambry'
import { playerMutex } from '../contexts/Player'

let wasPausedByDuck = false

const updateServerPosition = async () => {
  const position = await TrackPlayer.getPosition()
  const track = await TrackPlayer.getTrack(0)

  if (!track) {
    console.warn('Service: updateServerPosition called while no track loaded')
    return
  }

  const playerStateID = track.description

  const playerStateReport = {
    id: playerStateID,
    position: position.toString()
  }

  const userSession = await EncryptedStorage.getItem('userSession')
  const authData = JSON.parse(userSession)

  console.debug('Service: updating server position', playerStateReport)
  reportPlayerState(authData, playerStateReport)
}

const seekRelative = async interval => {
  console.debug('Service: seeking', interval)

  const position = await TrackPlayer.getPosition()
  const duration = await TrackPlayer.getDuration()
  const playbackRate = await TrackPlayer.getRate()
  const actualInterval = interval * playbackRate
  const targetDestination = position + actualInterval
  const actualDestination = Math.max(Math.min(targetDestination, duration), 0)

  await TrackPlayer.seekTo(actualDestination)

  updateServerPosition()
}

export default async function setup() {
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    playerMutex.runExclusive(() => {
      console.debug('Service: playback queue ended')
      updateServerPosition()
    })
  })

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    playerMutex.runExclusive(async () => {
      console.debug('Service: stop requested, destroying player')
      await TrackPlayer.pause()
      await seekRelative(-1)
      TrackPlayer.destroy()
    })
  })

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    playerMutex.runExclusive(async () => {
      console.debug('Service: pausing')
      await TrackPlayer.pause()
      seekRelative(-1)
    })
  })

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    playerMutex.runExclusive(async () => {
      console.debug('Service: playing')
      TrackPlayer.play()
    })
  })

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, ({ interval }) => {
    playerMutex.runExclusive(async () => {
      console.debug('Service: jump backward', interval)
      seekRelative(interval * -1)
    })
  })

  TrackPlayer.addEventListener(Event.RemoteJumpForward, ({ interval }) => {
    playerMutex.runExclusive(async () => {
      console.debug('Service: jump forward', interval)
      seekRelative(interval)
    })
  })

  TrackPlayer.addEventListener(Event.RemoteDuck, async e => {
    playerMutex.runExclusive(async () => {
      if (e.permanent === true) {
        console.debug('Service: duck permanent, pausing')
        TrackPlayer.pause()
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
  })
}
