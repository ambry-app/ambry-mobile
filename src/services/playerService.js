import TrackPlayer, { Event, State } from 'react-native-track-player'
import EncryptedStorage from 'react-native-encrypted-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { reportPlayerState } from '../api/ambry'

let wasPausedByDuck = false

async function sendState () {
  const userSession = await EncryptedStorage.getItem('userSession')
  const authData = JSON.parse(userSession)

  const track = await TrackPlayer.getTrack(0)

  if (!track) {
    return
  }

  const currentPlayerStateString = await AsyncStorage.getItem(track.url)
  if (!currentPlayerStateString) {
    return
  }

  const currentPlayerState = JSON.parse(currentPlayerStateString)
  const position = await TrackPlayer.getPosition()
  const playbackRate = await TrackPlayer.getRate()

  const playerStateReport = {
    id: currentPlayerState.id,
    position: position.toFixed(3),
    playbackRate: playbackRate.toFixed(2)
  }

  // only report to server non-zero positions; mitigates race conditions when
  // player not yet fully set-up
  if (playerStateReport.position != '0.000') {
    await reportPlayerState(authData, playerStateReport)

    const updatedPlayerState = {
      position,
      playbackRate,
      ...currentPlayerState
    }

    await AsyncStorage.setItem(track.url, JSON.stringify(updatedPlayerState))
  }
}

async function seekRelative (interval) {
  const position = await TrackPlayer.getPosition()
  const playbackRate = await TrackPlayer.getRate()
  const actualInterval = interval * playbackRate

  await TrackPlayer.seekTo(position + actualInterval)

  await sendState()
}

export default async function setup () {
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await TrackPlayer.pause()
    await seekRelative(-1)
    TrackPlayer.destroy()
  })

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    await TrackPlayer.pause()
    seekRelative(-1)
  })

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play()
  })

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, ({ interval }) => {
    seekRelative(interval * -1)
  })

  TrackPlayer.addEventListener(Event.RemoteJumpForward, ({ interval }) => {
    seekRelative(interval)
  })

  TrackPlayer.addEventListener(Event.RemoteDuck, async e => {
    if (e.permanent === true) {
      TrackPlayer.pause()
    } else {
      if (e.paused === true) {
        const playerState = await TrackPlayer.getState()
        wasPausedByDuck = playerState !== State.Paused
        await TrackPlayer.pause()
        await seekRelative(-1)
        sendState()
      } else {
        if (wasPausedByDuck === true) {
          TrackPlayer.play()
          wasPausedByDuck = false
        }
      }
    }
  })
}
