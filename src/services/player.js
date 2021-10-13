import TrackPlayer, { Event, State } from 'react-native-track-player'
import EncryptedStorage from 'react-native-encrypted-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { reportPlayerState } from '../api/ambry'

let wasPausedByDuck = false

async function sendState () {
  const userSession = await EncryptedStorage.getItem('userSession')
  const authData = JSON.parse(userSession)
  const currentPlayerStateString = await AsyncStorage.getItem(
    'currentPlayerState'
  )
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

  await reportPlayerState(authData, playerStateReport)

  const updatedPlayerState = {
    position: position,
    playbackRate: playbackRate,
    ...currentPlayerState
  }

  await AsyncStorage.setItem(
    'currentPlayerState',
    JSON.stringify(updatedPlayerState)
  )
}

export default async function setup () {
  TrackPlayer.addEventListener(Event.PlaybackState, x => {
    sendState()
  })

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    sendState()

    TrackPlayer.destroy()
  })

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    sendState()

    TrackPlayer.pause()
  })

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    sendState()

    TrackPlayer.play()
  })

  TrackPlayer.addEventListener(Event.RemoteDuck, async e => {
    sendState()

    if (e.permanent === true) {
      TrackPlayer.stop()
    } else {
      if (e.paused === true) {
        const playerState = await TrackPlayer.getState()
        wasPausedByDuck = playerState !== State.Paused
        TrackPlayer.pause()
      } else {
        if (wasPausedByDuck === true) {
          TrackPlayer.play()
          wasPausedByDuck = false
        }
      }
    }
  })
}
