import { Mutex } from 'async-mutex'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import TrackPlayer, {
  Capability,
  PitchAlgorithm,
  State,
  TrackType
} from 'react-native-track-player'
import { useImmer } from 'use-immer'
import { getPlayerState, reportPlayerState, uriSource } from '../api/ambry'
import { useAuth } from '../contexts/Auth'
import { useSelectedMedia } from '../contexts/SelectedMedia'

const initialState = {
  loading: true,
  error: false,
  media: undefined,
  imageSource: undefined,
  trackPlayerReady: false,
  position: undefined,
  buffered: undefined,
  playbackRate: undefined,
  currentChapter: undefined
}

export const playerMutex = new Mutex()

function mediaTrackForPlatform (authData, media) {
  const path = Platform.OS === 'ios' ? media.hlsPath : media.mpdPath
  const type = Platform.OS === 'ios' ? TrackType.HLS : TrackType.Dash
  const { uri: url } = uriSource(authData, path)

  return { url, type }
}

function findChapter (position, chapters) {
  return chapters.find(
    chapter => position >= chapter.startTime && position < chapter.endTime
  )
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

async function setTrackPlayerPlaybackRate (
  newPlaybackRate,
  authData,
  setPlaybackRate
) {
  playerMutex.runExclusive(async () => {
    console.debug('usePlayerState: setting playback rate', newPlaybackRate)

    // set rate on player async
    TrackPlayer.setRate(newPlaybackRate)

    // set rate state
    setPlaybackRate(newPlaybackRate)

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

function togglePlayback (authData) {
  playerMutex.runExclusive(() => togglePlaybackNoLock(authData))
}

async function seekRelativeNoLock (interval, authData) {
  console.debug('usePlayerState: seeking', interval)

  const position = await TrackPlayer.getPosition()
  const duration = await TrackPlayer.getDuration()
  const playbackRate = await TrackPlayer.getRate()
  const actualInterval = interval * playbackRate
  const targetDestination = position + actualInterval
  const actualDestination = Math.max(Math.min(targetDestination, duration), 0)

  await TrackPlayer.seekTo(actualDestination)

  updateServerPositionNoLock(authData)
}

async function seekToNoLock (position, authData) {
  console.debug('usePlayerState: seeking to', position)

  await TrackPlayer.seekTo(position)

  updateServerPositionNoLock(authData)
}

function seekTo (position, authData) {
  playerMutex.runExclusive(() => seekToNoLock(position, authData))
}

function usePosition (
  setPosition,
  trackPlayerReady,
  loading,
  playbackRate,
  media,
  currentChapter,
  isSeeking
) {
  const intervalRef = useRef()

  // TODO: fix drift by using setTimeout and keeping track of previous position
  // and correcting for drift each update.
  useEffect(() => {
    const updatePosition = async () => {
      const position = await TrackPlayer.getPosition()
      const chapter = findChapter(position, media.chapters)

      setPosition(position, chapter)
    }

    if (trackPlayerReady && !loading && !isSeeking) {
      intervalRef.current = setInterval(updatePosition, 1000 / playbackRate)
    }

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [
    trackPlayerReady,
    loading,
    playbackRate,
    media,
    currentChapter,
    isSeeking
  ])
}

function useBuffered (setBuffered, trackPlayerReady, loading) {
  const intervalRef = useRef()

  useEffect(() => {
    const updateBuffered = async () => {
      const buffered = await TrackPlayer.getBufferedPosition()

      setBuffered(buffered)
    }

    if (trackPlayerReady && !loading) {
      updateBuffered()
      intervalRef.current = setInterval(updateBuffered, 1000)
    }

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [trackPlayerReady, loading])
}

export default function usePlayerState () {
  const { authData, signOut } = useAuth()
  const { selectedMedia } = useSelectedMedia()
  const [state, updateState] = useImmer(initialState)

  const {
    currentChapter,
    media,
    trackPlayerReady,
    loading,
    playbackRate,
    position
  } = state

  // state updaters

  const setReady = () => {
    updateState(draft => {
      draft.trackPlayerReady = true
    })
  }

  const setEmpty = () => {
    updateState(draft => {
      draft.loading = false
      draft.playerState = null
      draft.media = null
      draft.imageSource = null
      draft.playbackRate = null
    })
  }

  const setLoading = selectedMedia => {
    updateState(draft => {
      draft.loading = true
      draft.playerState = undefined
      draft.media = selectedMedia
      draft.imageSource = uriSource(authData, selectedMedia.book.imagePath)
      draft.playbackRate = null
    })
  }

  const setLoaded = (position, playbackRate, chapter) => {
    updateState(draft => {
      draft.loading = false
      draft.position = position
      draft.buffered = 0
      draft.currentChapter = chapter
      draft.playbackRate = playbackRate
    })
  }

  const setPosition = (position, chapter) => {
    updateState(draft => {
      draft.position = position
      draft.currentChapter = chapter
    })
  }

  const setBuffered = buffered => {
    updateState(draft => {
      draft.buffered = buffered
    })
  }

  const setPlaybackRate = rate => {
    updateState(draft => {
      draft.playbackRate = rate
    })
  }

  const setError = () => {
    updateState(draft => {
      draft.loading = false
      draft.error = true
    })
  }

  // effects

  useEffect(() => {
    const setupTrackPlayer = async () => {
      console.debug('usePlayerState: setting up TrackPlayer...')

      const track = await TrackPlayer.getTrack(0)
      if (track) {
        console.debug('usePlayerState: TrackPlayer already set up')
        setReady()
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
      setReady()
    }

    playerMutex.runExclusive(setupTrackPlayer)
  }, [])

  useEffect(() => {
    const loadPlayerStateFromServer = async () => {
      if (selectedMedia === undefined) {
        console.debug('usePlayerState: selectedMedia is undefined')
        return
      }

      if (selectedMedia === null) {
        console.debug('usePlayerState: no selectedMedia')
        setEmpty()
        return
      }

      try {
        // loading, but media is available
        setLoading(selectedMedia)

        console.debug(
          `usePlayerState: loading playerState ${selectedMedia.id} from server`
        )
        const serverPlayerState = await getPlayerState(
          authData,
          selectedMedia.id
        )

        console.debug('usePlayerState: playerState loaded', serverPlayerState)
        loadTrackIntoPlayer(selectedMedia, serverPlayerState)
      } catch (err) {
        console.error('usePlayerState: failed to load playerState', err)

        if (err == 401) {
          await signOut()
        } else {
          setError()
        }
      }
    }

    const loadTrackIntoPlayer = async (media, playerState) => {
      const mediaTrack = mediaTrackForPlatform(authData, media)
      const { uri: artworkUrl, headers } = uriSource(
        authData,
        media.book.imagePath
      )
      const { position, playbackRate } = playerState

      const currentTrack = await TrackPlayer.getTrack(0)

      if (currentTrack && currentTrack.description == playerState.id) {
        // the current track is already loaded; nothing to do
        console.debug('usePlayerState: track already loaded')

        const [currentPosition, currentPlaybackRate] = await Promise.all([
          TrackPlayer.getPosition(),
          TrackPlayer.getRate()
        ])

        const chapter = findChapter(currentPosition, media.chapters)

        setLoaded(currentPosition, currentPlaybackRate, chapter)
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
          duration: media.duration,
          title: media.book.title,
          artist: media.book.authors.map(author => author.name).join(', '),
          artwork: artworkUrl,
          description: playerState.id,
          headers
        })

        await TrackPlayer.seekTo(position)
        await TrackPlayer.setRate(playbackRate)

        const chapter = findChapter(position, media.chapters)

        setLoaded(position, playbackRate, chapter)
      }
    }

    if (trackPlayerReady) {
      loadPlayerStateFromServer()
    }
  }, [trackPlayerReady, selectedMedia])

  const [isSeeking, setIsSeeking] = useState(false)

  usePosition(
    setPosition,
    trackPlayerReady,
    loading,
    playbackRate,
    media,
    currentChapter,
    isSeeking
  )

  useBuffered(setBuffered, trackPlayerReady, loading)

  const seekTimerRef = useRef()
  const seekRelativeAction = useCallback(
    interval => {
      setIsSeeking(true)
      const actualInterval = interval * playbackRate
      const targetDestination = position + actualInterval
      const actualDestination = Math.max(
        Math.min(targetDestination, media.duration),
        0
      )
      const chapter = findChapter(actualDestination, media.chapters)

      setPosition(actualDestination, chapter)

      // throttle actually seeking TrackPlayer
      clearTimeout(seekTimerRef.current)
      seekTimerRef.current = setTimeout(() => {
        setIsSeeking(false)
        seekTo(actualDestination, authData)
      }, 500)
    },
    [position, playbackRate, media]
  )

  const seekToAction = useCallback(
    position => {
      const chapter = findChapter(position, media.chapters)

      setPosition(position, chapter)
      seekTo(position, authData)
    },
    [media]
  )

  // return

  const actions = {
    setPlaybackRate: rate =>
      setTrackPlayerPlaybackRate(rate, authData, setPlaybackRate),
    togglePlayback: () => togglePlayback(authData),
    seekRelative: seekRelativeAction,
    seekTo: seekToAction
  }

  return { state, actions }
}
