import { Mutex } from 'async-mutex'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { Platform } from 'react-native'
import TrackPlayer, {
  Capability,
  PitchAlgorithm,
  State,
  TrackType
} from 'react-native-track-player'
import { useAmbryAPI } from '../contexts/AmbryAPI'
import { useSelectedMedia } from '../contexts/SelectedMedia'
import useFirstRender from '../hooks/firstRender'

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

const setReady = state => ({
  ...state,
  trackPlayerReady: true
})

const setEmpty = state => ({
  ...state,
  loading: false,
  media: null,
  imageSource: null,
  playbackRate: null
})

const setLoading = imageSource => state => ({
  ...state,
  loading: true,
  media: undefined,
  imageSource: imageSource,
  playbackRate: null
})

const setLoaded = (media, position, playbackRate, chapter) => state => ({
  ...state,
  loading: false,
  media: media,
  position: position,
  buffered: 0,
  currentChapter: chapter,
  playbackRate: playbackRate
})

const setPosition = (position, buffered, chapter) => state => ({
  ...state,
  position: position,
  buffered: buffered,
  currentChapter: chapter
})

const setPlaybackRate = rate => state => ({
  ...state,
  playbackRate: rate
})

const setError = state => ({
  ...state,
  loading: false,
  error: true
})

const PlayerContext = createContext({})

export const playerMutex = new Mutex()

function mediaTrackForPlatform(uriSource, media) {
  const path = Platform.OS === 'ios' ? media.hlsPath : media.mpdPath
  const type = Platform.OS === 'ios' ? TrackType.HLS : TrackType.Dash
  const { uri: url } = uriSource(path)

  return { url, type }
}

function findChapter(position, chapters) {
  const rounded = Math.round(position)
  return chapters.find(
    chapter =>
      rounded >= chapter.startTime &&
      (!chapter.endTime || rounded < chapter.endTime)
  )
}

async function updateServerPositionNoLock(reportPlayerState) {
  const position = await TrackPlayer.getPosition()
  const track = await TrackPlayer.getTrack(0)

  if (!track) {
    console.warn('Player: updateServerPosition called while no track loaded')
    return
  }

  const playerStateID = track.description

  const playerStateReport = {
    id: playerStateID,
    position: position.toString()
  }

  console.debug('Player: updating server position', playerStateReport)
  reportPlayerState(playerStateReport)
}

async function setTrackPlayerPlaybackRate(
  newPlaybackRate,
  reportPlayerState,
  setState
) {
  playerMutex.runExclusive(async () => {
    console.debug('Player: setting playback rate', newPlaybackRate)

    // set rate on player async
    TrackPlayer.setRate(newPlaybackRate)

    // set rate state
    setState(setPlaybackRate(newPlaybackRate))

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
    reportPlayerState(playerStateReport)
  })
}

async function togglePlaybackNoLock(reportPlayerState) {
  console.debug('Player: toggling playback')

  const playbackState = await TrackPlayer.getState()

  if (playbackState !== State.Playing) {
    console.debug('Player: playing')
    await TrackPlayer.play()
  } else {
    console.debug('Player: pausing')
    await TrackPlayer.pause()
    seekRelativeNoLock(-1, reportPlayerState)
  }
}

function togglePlayback(reportPlayerState) {
  playerMutex.runExclusive(() => togglePlaybackNoLock(reportPlayerState))
}

async function seekRelativeNoLock(interval, reportPlayerState) {
  console.debug('Player: seeking', interval)

  const position = await TrackPlayer.getPosition()
  const duration = await TrackPlayer.getDuration()
  const playbackRate = await TrackPlayer.getRate()
  const actualInterval = interval * playbackRate
  const targetDestination = position + actualInterval
  const actualDestination = Math.max(Math.min(targetDestination, duration), 0)

  await TrackPlayer.seekTo(actualDestination)

  updateServerPositionNoLock(reportPlayerState)
}

async function seekToNoLock(position, reportPlayerState) {
  console.debug('Player: seeking to', position)

  await TrackPlayer.seekTo(position)

  updateServerPositionNoLock(reportPlayerState)
}

function seekTo(position, reportPlayerState) {
  playerMutex.runExclusive(() => seekToNoLock(position, reportPlayerState))
}

function usePosition(
  setState,
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
    if (!media) {
      return
    }

    const updatePosition = async () => {
      const [position, buffered] = await Promise.all([
        TrackPlayer.getPosition(),
        TrackPlayer.getBufferedPosition()
      ])
      const chapter = findChapter(position, media.chapters)

      setState(setPosition(position, buffered, chapter))
    }

    if (trackPlayerReady && !loading && !isSeeking) {
      intervalRef.current = setInterval(updatePosition, 1000 / playbackRate)
    }

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [
    setState,
    trackPlayerReady,
    loading,
    playbackRate,
    media,
    currentChapter,
    isSeeking
  ])
}

export default function PlayerProvider({ children }) {
  const isFirstRender = useFirstRender()
  const { getPlayerState, reportPlayerState, uriSource } = useAmbryAPI()
  const { selectedMedia } = useSelectedMedia()
  const [state, setState] = useState(initialState)

  const {
    currentChapter,
    media,
    trackPlayerReady,
    loading,
    playbackRate,
    position
  } = state

  // effects

  if (isFirstRender) {
    const setupTrackPlayer = async () => {
      console.debug('Player: setting up TrackPlayer...')

      const track = await TrackPlayer.getTrack(0)
      if (track) {
        console.debug('Player: TrackPlayer already set up')
        setState(setReady)
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

      console.debug('Player: done setting up TrackPlayer')
      setState(setReady)
    }

    playerMutex.runExclusive(setupTrackPlayer)
  }

  useEffect(() => {
    const loadPlayerStateFromServer = async () => {
      if (selectedMedia === undefined) {
        console.debug('Player: selectedMedia is undefined')
        return
      }

      if (selectedMedia === null) {
        console.debug('Player: no selectedMedia')
        setState(setEmpty)
        return
      }

      try {
        // loading, but image is available
        setState(setLoading(uriSource(selectedMedia.imagePath)))

        console.debug(
          `Player: loading playerState ${selectedMedia.id} from server`
        )
        const serverPlayerState = await getPlayerState(selectedMedia.id)

        console.debug('Player: playerState loaded', serverPlayerState)
        loadTrackIntoPlayer(serverPlayerState)
      } catch (err) {
        console.error('Player: failed to load playerState', err)
        setState(setError)
      }
    }

    const loadTrackIntoPlayer = async playerState => {
      const mediaTrack = mediaTrackForPlatform(uriSource, playerState.media)
      const { uri: artworkUrl, headers } = uriSource(
        playerState.media.book.imagePath
      )

      const currentTrack = await TrackPlayer.getTrack(0)

      if (currentTrack && currentTrack.description === playerState.id) {
        // the current track is already loaded; nothing to do
        console.debug('Player: track already loaded')

        const [currentPosition, currentPlaybackRate] = await Promise.all([
          TrackPlayer.getPosition(),
          TrackPlayer.getRate()
        ])

        const chapter = findChapter(currentPosition, playerState.media.chapters)

        setState(
          setLoaded(
            playerState.media,
            currentPosition,
            currentPlaybackRate,
            chapter
          )
        )
      } else {
        // report previous track position
        if (currentTrack) {
          await updateServerPositionNoLock(reportPlayerState)
        }

        // load new track
        console.debug('Player: loading track', mediaTrack)

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

        const chapter = findChapter(
          playerState.position,
          playerState.media.chapters
        )

        setState(
          setLoaded(
            playerState.media,
            playerState.position,
            playerState.playbackRate,
            chapter
          )
        )
      }
    }

    if (trackPlayerReady) {
      loadPlayerStateFromServer()
    }
  }, [
    getPlayerState,
    reportPlayerState,
    uriSource,
    trackPlayerReady,
    selectedMedia
  ])

  const [isSeeking, setIsSeeking] = useState(false)

  usePosition(
    setState,
    trackPlayerReady,
    loading,
    playbackRate,
    media,
    currentChapter,
    isSeeking
  )

  // actions

  const setPlaybackRateAction = useCallback(
    rate => setTrackPlayerPlaybackRate(rate, reportPlayerState, setState),
    [reportPlayerState]
  )

  const togglePlaybackAction = useCallback(
    () => togglePlayback(reportPlayerState),
    [reportPlayerState]
  )

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

      setState(setPosition(actualDestination, 0, chapter))

      // throttle actually seeking TrackPlayer
      clearTimeout(seekTimerRef.current)
      seekTimerRef.current = setTimeout(() => {
        setIsSeeking(false)
        seekTo(actualDestination, reportPlayerState)
      }, 500)
    },
    [reportPlayerState, position, playbackRate, media]
  )

  const seekToAction = useCallback(
    newPosition => {
      const chapter = findChapter(newPosition, media.chapters)

      setState(setPosition(newPosition, 0, chapter))
      seekTo(newPosition, reportPlayerState)
    },
    [reportPlayerState, media]
  )

  // return

  const actions = {
    setPlaybackRate: setPlaybackRateAction,
    togglePlayback: togglePlaybackAction,
    seekRelative: seekRelativeAction,
    seekTo: seekToAction
  }

  return (
    <PlayerContext.Provider value={{ state, actions }}>
      {children}
    </PlayerContext.Provider>
  )
}

function usePlayer() {
  const context = useContext(PlayerContext)

  if (!context) {
    throw new Error('usePlayer must be used within an PlayerProvider')
  }

  return context
}

export { PlayerContext, PlayerProvider, usePlayer }
