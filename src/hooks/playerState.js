import { Mutex } from 'async-mutex'
import { useEffect, useReducer } from 'react'
import { Platform } from 'react-native'
import TrackPlayer, {
  Capability,
  PitchAlgorithm,
  State,
  TrackType
} from 'react-native-track-player'
import { getPlayerState, reportPlayerState, uriSource } from '../api/ambry'
import { useAuth } from '../contexts/Auth'
import { useSelectedMedia } from '../contexts/SelectedMedia'
import { actionCreators, initialState, reducer } from '../reducers/playerState'

export const playerMutex = new Mutex()

async function setupTrackPlayer (dispatch) {
  playerMutex.runExclusive(async () => {
    console.debug('usePlayerState: setting up TrackPlayer...')

    const track = await TrackPlayer.getTrack(0)
    if (track) {
      console.debug(new Date(), 'usePlayerState: TrackPlayer already set up')
      dispatch(actionCreators.trackPlayerReady())
      return
    }

    await TrackPlayer.setupPlayer({
      minBuffer: 180,
      maxBuffer: 300,
      backBuffer: 120
    })
    await TrackPlayer.updateOptions({
      stopWithApp: false,
      alwaysPauseOnInterruption: true,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.JumpForward,
        Capability.JumpBackward,
        Capability.Stop
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.JumpBackward,
        Capability.JumpForward
      ],
      forwardJumpInterval: 10,
      backwardJumpInterval: 10
    })

    console.debug('usePlayerState: done setting up TrackPlayer')
    dispatch(actionCreators.trackPlayerReady())
  })
}

async function loadPlayerStateFromServer (
  selectedMediaID,
  authData,
  signOut,
  dispatch
) {
  if (selectedMediaID === null) {
    console.debug('usePlayerState: no selectedMediaID')
    dispatch(actionCreators.empty())
    return
  }

  try {
    dispatch(actionCreators.loading())

    console.debug(
      `usePlayerState: loading playerState ${selectedMediaID} from server`
    )
    const serverPlayerState = await getPlayerState(authData, selectedMediaID)

    console.debug('usePlayerState: playerState loaded', serverPlayerState)
    dispatch(actionCreators.loaded(serverPlayerState, authData))
  } catch (error) {
    console.error('usePlayerState: failed to load playerState', error)

    if (error == 401) {
      await signOut()
    } else {
      dispatch(actionCreators.failure())
    }
  }
}

function mediaTrackForPlatform (authData, playerState) {
  const path =
    Platform.OS === 'ios'
      ? playerState.media.hlsPath
      : playerState.media.mpdPath
  const type = Platform.OS === 'ios' ? TrackType.HLS : TrackType.Dash
  const { uri: url } = uriSource(authData, path)

  return { url, type }
}

async function loadTrackIntoPlayer (authData, playerState, dispatch) {
  const mediaTrack = mediaTrackForPlatform(authData, playerState)
  const { uri: artworkUrl, headers } = uriSource(
    authData,
    playerState.media.book.imagePath
  )

  playerMutex.runExclusive(async () => {
    dispatch(actionCreators.loadingTrack(true))
    const currentTrack = await TrackPlayer.getTrack(0)

    if (currentTrack && currentTrack.description == playerState.id) {
      // the current track is already loaded; nothing to do
      console.debug('usePlayerState: track already loaded')

      dispatch(actionCreators.loadingTrack(false))
    } else {
      // report previous track position
      if (currentTrack) {
        await updateServerPositionNoLock(authData)
      }

      // load new track
      console.debug('usePlayerState: loading track', mediaTrack)

      await TrackPlayer.reset()
      await TrackPlayer.add({
        url: mediaTrack.url,
        type: mediaTrack.type,
        pitchAlgorithm: PitchAlgorithm.Voice,
        duration: playerState.media.duration,
        title: playerState.media.book.title,
        artist: playerState.media.book.authors
          .map(author => author.name)
          .join(', '),
        artwork: artworkUrl,
        description: playerState.id,
        headers
      })

      await TrackPlayer.seekTo(playerState.position)
      await TrackPlayer.setRate(playerState.playbackRate)

      dispatch(actionCreators.loadingTrack(false))
    }
  })
}

async function updateServerPositionNoLock (authData) {
  const position = await TrackPlayer.getPosition()
  const track = await TrackPlayer.getTrack(0)

  if (!track) {
    console.warn(
      'usePlayerState: updateServerPosition called while no track loaded'
    )
    return
  }

  const playerStateID = track.description

  const playerStateReport = {
    id: playerStateID,
    position: position.toFixed(3)
  }

  console.debug('usePlayerState: updating server position', playerStateReport)
  reportPlayerState(authData, playerStateReport)
}

async function setPlaybackRate (newPlaybackRate, authData, dispatch) {
  playerMutex.runExclusive(async () => {
    console.debug('usePlayerState: setting playback rate', newPlaybackRate)

    // set rate on player async
    TrackPlayer.setRate(newPlaybackRate)

    // set rate state
    dispatch(actionCreators.setPlaybackRate(newPlaybackRate))

    const track = await TrackPlayer.getTrack(0)

    if (!track) {
      console.warn(
        'usePlayerState: setPlaybackRate called while no track loaded'
      )
      return
    }

    const playerStateID = track.description

    const playerStateReport = {
      id: playerStateID,
      playbackRate: newPlaybackRate.toFixed(2)
    }

    console.debug(
      'usePlayerState: updating server playback rate',
      playerStateReport
    )
    reportPlayerState(authData, playerStateReport)
  })
}

async function togglePlaybackNoLock (authData) {
  const currentTrack = await TrackPlayer.getCurrentTrack()

  if (currentTrack == null) {
    console.warn('usePlayerState: toggling playback on null track')
  } else {
    console.debug('usePlayerState: toggling playback')

    const playbackState = await TrackPlayer.getState()

    if (playbackState !== State.Playing) {
      console.debug('usePlayerState: playing')
      await TrackPlayer.play()
    } else {
      console.debug('usePlayerState: pausing')
      await TrackPlayer.pause()
      seekRelativeNoLock(-1, authData)
    }
  }
}

function togglePlayback (authData) {
  playerMutex.runExclusive(() => togglePlaybackNoLock(authData))
}

async function seekRelativeNoLock (interval, authData) {
  console.debug('Player: seeking', interval)

  const position = await TrackPlayer.getPosition()
  const duration = await TrackPlayer.getDuration()
  const playbackRate = await TrackPlayer.getRate()
  const actualInterval = interval * playbackRate
  const targetDestination = position + actualInterval
  const actualDestination = Math.max(Math.min(targetDestination, duration), 0)

  await TrackPlayer.seekTo(actualDestination)

  updateServerPositionNoLock(authData)
}

function seekRelative (interval, authData) {
  playerMutex.runExclusive(() => seekRelativeNoLock(interval, authData))
}

async function seekToNoLock (position, authData) {
  console.debug('usePlayerState: seeking to', position)

  await TrackPlayer.seekTo(position)

  updateServerPositionNoLock(authData)
}

function seekTo (position, authData) {
  playerMutex.runExclusive(() => seekToNoLock(position, authData))
}

export default function usePlayerState () {
  const { authData, signOut } = useAuth()
  const { selectedMediaID } = useSelectedMedia()
  const [state, dispatch] = useReducer(reducer, initialState)

  const { playerState, trackPlayerReady } = state

  const actions = {
    setPlaybackRate: rate => setPlaybackRate(rate, authData, dispatch),
    togglePlayback: () => togglePlayback(authData),
    seekRelative: interval => seekRelative(interval, authData),
    seekTo: interval => seekTo(interval, authData)
  }

  useEffect(() => {
    setupTrackPlayer(dispatch)
  }, [])

  useEffect(() => {
    if (selectedMediaID || selectedMediaID === null) {
      loadPlayerStateFromServer(selectedMediaID, authData, signOut, dispatch)
    }
  }, [selectedMediaID])

  useEffect(() => {
    if (playerState && trackPlayerReady) {
      loadTrackIntoPlayer(authData, playerState, dispatch)
    }
  }, [playerState, trackPlayerReady])

  return { state, actions }
}
