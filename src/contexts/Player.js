import AsyncStorage from '@react-native-async-storage/async-storage'
import { Mutex } from 'async-mutex'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import TrackPlayer, {
  Capability,
  State,
  TrackType,
  usePlaybackState
} from 'react-native-track-player'
import { getPlayerState, reportPlayerState, uriSource } from '../api/ambry'
import { useAuth } from './Auth'

const playerMutex = new Mutex()
const PlayerContext = createContext({})

// Provider

const PlayerProvider = ({ children }) => {
  const { authData, signOut } = useAuth()
  const playbackState = usePlaybackState()
  const [trackPlayerReady, setTrackPlayerReady] = useState(false)
  const [playerState, setPlayerState] = useState()
  const [media, setMedia] = useState()
  const [playbackRate, setPlaybackRate] = useState()
  const [imageSource, setImageSource] = useState()
  const [loadingMedia, setLoadingMedia] = useState(true)
  const [loadingTrack, setLoadingTrack] = useState(true)
  const [error, setError] = useState(false)

  // Effect callbacks
  async function setupTrackPlayer () {
    playerMutex.runExclusive(async () => {
      console.debug('Player: setting up TrackPlayer...')

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

      console.debug('Player: done setting up TrackPlayer')
      setTrackPlayerReady(true)
    })
  }

  async function loadStoredPlayerState () {
    try {
      setLoadingMedia(true)

      console.debug('Player: loading playerStateID from AsyncStorage')
      const playerStateID = await AsyncStorage.getItem('playerStateID')

      if (!playerStateID) {
        console.debug('Player: no playerStateID found')
        setPlayerState(null)
        return
      }

      console.debug(`Player: loading playerState ${playerStateID} from server`)
      const serverPlayerState = await getPlayerState(authData, playerStateID)

      console.debug('Player: playerState loaded', serverPlayerState)
      setPlayerState(serverPlayerState)
    } catch (error) {
      console.error('Player: failed to load playerState', error)

      if (error == 401) {
        await signOut()
      } else {
        setError(true)
      }
    } finally {
      setLoadingMedia(false)
    }
  }

  async function loadTrackIntoPlayer () {
    const { uri: mpdUrl, headers } = uriSource(
      authData,
      playerState.media.mpdPath
    )
    const { uri: artworkUrl } = uriSource(
      authData,
      playerState.media.book.imagePath
    )

    playerMutex.runExclusive(async () => {
      const currentTrack = await TrackPlayer.getTrack(0)

      if (currentTrack && currentTrack.description === playerState.id) {
        // the current track is already loaded; nothing to do
        console.debug('Player: track already loaded')
      } else {
        setLoadingTrack(true)

        // report previous track position
        if (currentTrack) {
          await updateServerPositionNoLock()
        }

        // load new track
        console.debug('Player: loading track', mpdUrl)

        await TrackPlayer.reset()
        await TrackPlayer.add({
          url: mpdUrl,
          type: TrackType.Dash,
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

        setLoadingTrack(false)
      }
    })
  }

  useEffect(() => {
    setupTrackPlayer()
    loadStoredPlayerState()
  }, [])

  useEffect(() => {
    if (playerState && trackPlayerReady) {
      loadTrackIntoPlayer()
    }
  }, [playerState, trackPlayerReady])

  useEffect(() => {
    if (playerState) {
      setImageSource(uriSource(authData, playerState.media.book.imagePath))
      setMedia(playerState.media)
      setPlaybackRate(playerState.playbackRate)
    } else if (playerState === null) {
      setMedia(null)
    }
  }, [playerState])

  // report progress every 1 minute, at least while this context is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (playbackState === State.Playing) {
        updateServerPosition()
      }
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [playbackState])

  // Actions

  const loadMedia = useCallback(async mediaId => {
    try {
      setLoadingMedia(true)

      console.debug(`Player: loading playerState ${mediaId} from server`)
      const serverPlayerState = await getPlayerState(authData, mediaId)

      console.debug('Player: playerState loaded', serverPlayerState)
      AsyncStorage.setItem('playerStateID', mediaId.toString())
      setPlayerState(serverPlayerState)
    } catch (error) {
      if (error == 401) {
        await signOut()
      } else {
        setError(true)
      }
    } finally {
      setLoadingMedia(false)
    }
  }, [])

  const togglePlaybackNoLock = async () => {
    const currentTrack = await TrackPlayer.getCurrentTrack()

    if (currentTrack == null) {
      console.warn('Player: toggling playback on null track')
    } else {
      console.debug('Player: toggling playback')

      const playbackState = await TrackPlayer.getState()

      if (playbackState !== State.Playing) {
        console.debug('Player: playing')
        await TrackPlayer.play()
      } else {
        console.debug('Player: pausing')
        await TrackPlayer.pause()
        seekRelativeNoLock(-1)
      }
    }
  }

  const togglePlayback = useCallback(async () => {
    playerMutex.runExclusive(togglePlaybackNoLock)
  }, [])

  const seekRelativeNoLock = async interval => {
    console.debug('Player: seeking', interval)

    const position = await TrackPlayer.getPosition()
    const duration = await TrackPlayer.getDuration()
    const playbackRate = await TrackPlayer.getRate()
    const actualInterval = interval * playbackRate
    const targetDestination = position + actualInterval
    const actualDestination = Math.max(Math.min(targetDestination, duration), 0)

    await TrackPlayer.seekTo(actualDestination)

    updateServerPositionNoLock()
  }

  const seekRelative = useCallback(async interval => {
    playerMutex.runExclusive(async () => seekRelativeNoLock(interval))
  }, [])

  const updateServerPositionNoLock = async () => {
    const position = await TrackPlayer.getPosition()
    const track = await TrackPlayer.getTrack(0)

    if (!track) {
      console.warn('Player: updateServerPosition called while no track loaded')
      return
    }

    const playerStateID = track.description

    const playerStateReport = {
      id: playerStateID,
      position: position.toFixed(3)
    }

    console.debug('Player: updating server position', playerStateReport)
    reportPlayerState(authData, playerStateReport)
  }

  const updateServerPosition = async () => {
    playerMutex.runExclusive(updateServerPositionNoLock)
  }

  const setPlaybackRateAction = useCallback(async newPlaybackRate => {
    playerMutex.runExclusive(async () => {
      console.debug('Player: setting playback rate', newPlaybackRate)

      // set rate on player async
      TrackPlayer.setRate(newPlaybackRate)

      // set rate context state
      setPlaybackRate(newPlaybackRate)

      const track = await TrackPlayer.getTrack(0)

      if (!track) {
        console.warn('Player: setPlaybackRate called while no track loaded')
        return
      }

      const playerStateID = track.description

      const playerStateReport = {
        id: playerStateID,
        playbackRate: newPlaybackRate.toFixed(2)
      }

      console.debug('Player: updating server playback rate', playerStateReport)
      reportPlayerState(authData, playerStateReport)
    })
  }, [])

  return (
    <PlayerContext.Provider
      value={{
        // props
        media,
        playbackRate,
        imageSource,
        loadingMedia,
        loadingTrack,
        error,

        // actions
        loadMedia,
        setPlaybackRate: setPlaybackRateAction,
        togglePlayback,
        seekRelative
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

// Hook

function usePlayer () {
  const context = useContext(PlayerContext)

  if (!context) {
    throw new Error('usePlayer must be used within an PlayerProvider')
  }

  return context
}

export { PlayerContext, PlayerProvider, playerMutex, usePlayer }
