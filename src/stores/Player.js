import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import TrackPlayer, {
  Capability,
  PitchAlgorithm,
  State,
  TrackType
} from 'react-native-track-player'
import create from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import shallow from 'zustand/shallow'
import { getPlayerState, reportPlayerState, uriSource } from './AmbryAPI'

// Store:

const useStore = create(
  subscribeWithSelector(
    persist(
      () => ({
        selectedMedia: undefined,
        mediaLoading: true,
        mediaError: false,
        media: undefined,
        imageSource: undefined,
        trackPlayerReady: false,
        position: undefined,
        buffered: undefined,
        playbackRate: undefined,
        currentChapter: undefined,
        isSeeking: false,
        _hasHydrated: false
      }),
      {
        name: '@Ambry_selectedMedia',
        getStorage: () => AsyncStorage,
        // only persist these values:
        partialize: state => ({
          selectedMedia: state.selectedMedia
        }),
        onRehydrateStorage: _initialState => {
          console.debug('Player: Hydrating')

          return (_state, error) => {
            if (error) {
              console.error('Player: An error happened during hydration', error)
            } else {
              console.debug('Player: Hydration finished')
              useStore.setState({ _hasHydrated: true })
            }
          }
        }
      }
    )
  )
)

export default useStore

// Subscriptions:

useStore.subscribe(
  state => state._hasHydrated,
  hydrated => {
    if (hydrated) {
      setupTrackPlayer()
    }
  }
)

useStore.subscribe(
  state => [state.trackPlayerReady, state.selectedMedia],
  ([trackPlayerReady, selectedMedia]) => {
    if (trackPlayerReady) {
      loadPlayerStateFromServer(selectedMedia)
    }
  },
  { equalityFn: shallow }
)

useStore.subscribe(
  state => ({
    media: state.media,
    trackPlayerReady: state.trackPlayerReady,
    mediaLoading: state.mediaLoading,
    isSeeking: state.isSeeking,
    playbackRate: state.playbackRate
  }),
  state => {
    positionTimer(state)
  },
  { equalityFn: shallow }
)

// Support:

export const setupTrackPlayer = async () => {
  console.debug('Player: setting up TrackPlayer...')

  const track = await TrackPlayer.getTrack(0)
  if (track) {
    console.debug('Player: TrackPlayer already set up')
    useStore.setState({ trackPlayerReady: true })
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
  useStore.setState({ trackPlayerReady: true })
}

const calculateSeekPosition = (interval, playbackRate, position, media) => {
  const actualInterval = interval * playbackRate
  const targetDestination = position + actualInterval
  const actualDestination = Math.max(
    Math.min(targetDestination, media.duration),
    0
  )
  const chapter = findChapter(actualDestination, media.chapters)

  return [actualDestination, chapter]
}

const seekRelativeState = interval => {
  const { playbackRate, position, media } = useStore.getState()

  const [destination, chapter] = calculateSeekPosition(
    interval,
    playbackRate,
    position,
    media
  )

  useStore.setState({
    position: destination,
    buffered: 0,
    currentChapter: chapter
  })

  return [destination, chapter]
}

const updatePosition = async media => {
  const [position, buffered] = await Promise.all([
    TrackPlayer.getPosition(),
    TrackPlayer.getBufferedPosition()
  ])
  const chapter = findChapter(position, media.chapters)

  useStore.setState({
    position: position,
    buffered: buffered,
    currentChapter: chapter
  })
}

const positionTimer = (() => {
  let positionTimerRef

  return state => {
    const { media, trackPlayerReady, mediaLoading, isSeeking, playbackRate } =
      state

    if (!media) {
      clearInterval(positionTimerRef)
      return
    }

    if (trackPlayerReady && !mediaLoading && !isSeeking) {
      clearInterval(positionTimerRef)

      positionTimerRef = setInterval(
        () => updatePosition(media),
        1000 / playbackRate
      )
    } else {
      clearInterval(positionTimerRef)
    }
  }
})()

const loadPlayerStateFromServer = async selectedMedia => {
  if (selectedMedia === undefined) {
    console.debug('Player: selectedMedia is undefined')
    return
  }

  if (selectedMedia === null) {
    console.debug('Player: no selectedMedia')
    useStore.setState({
      mediaLoading: false,
      media: null,
      imageSource: null,
      playbackRate: null
    })
    return
  }

  try {
    // loading, but image is available
    useStore.setState({
      mediaLoading: true,
      media: undefined,
      imageSource: uriSource(selectedMedia.imagePath),
      playbackRate: null
    })

    console.debug(`Player: loading playerState ${selectedMedia.id} from server`)
    const serverPlayerState = await getPlayerState(selectedMedia.id)

    console.debug('Player: playerState loaded', serverPlayerState)
    loadTrackIntoPlayer(serverPlayerState)
  } catch (err) {
    console.error('Player: failed to load playerState', err)
    useStore.setState({
      mediaLoading: false,
      mediaError: true
    })
  }
}

const loadTrackIntoPlayer = async playerState => {
  const mediaTrack = mediaTrackForPlatform(playerState.media)
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

    useStore.setState({
      mediaLoading: false,
      media: playerState.media,
      position: currentPosition,
      buffered: 0,
      currentChapter: chapter,
      playbackRate: currentPlaybackRate
    })
  } else {
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

    useStore.setState({
      mediaLoading: false,
      media: playerState.media,
      position: playerState.position,
      buffered: 0,
      currentChapter: chapter,
      playbackRate: playerState.playbackRate
    })
  }
}

const mediaTrackForPlatform = media => {
  const path = Platform.OS === 'ios' ? media.hlsPath : media.mpdPath
  const type = Platform.OS === 'ios' ? TrackType.HLS : TrackType.Dash
  const { uri: url } = uriSource(path)

  return { url, type }
}

const findChapter = (position, chapters) => {
  const rounded = Math.round(position)
  return chapters.find(
    chapter =>
      rounded >= chapter.startTime &&
      (!chapter.endTime || rounded < chapter.endTime)
  )
}

const updateServerPosition = async () => {
  const [position, track] = await Promise.all([
    TrackPlayer.getPosition(),
    TrackPlayer.getTrack(0)
  ])

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
  return reportPlayerState(playerStateReport)
}

// Actions:

export const loadMedia = async (id, imagePath) => {
  const newSelectedMedia = { id, imagePath }

  await updateServerPosition()

  console.debug(`Player: selecting ${newSelectedMedia.id}`)

  useStore.setState({
    selectedMedia: newSelectedMedia
  })
}

export const clearMedia = () => {
  console.debug(`Player: clearing`)

  useStore.setState({
    selectedMedia: null
  })
}

export const setPlaybackRate = async newPlaybackRate => {
  console.debug('Player: setting playback rate', newPlaybackRate)

  // set rate on player async
  TrackPlayer.setRate(newPlaybackRate)

  // set rate state
  useStore.setState({ playbackRate: newPlaybackRate })

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
  return reportPlayerState(playerStateReport)
}

export const togglePlayback = async () => {
  console.debug('Player: toggling playback')

  const playbackState = await TrackPlayer.getState()

  if (playbackState !== State.Playing) {
    return play()
  } else {
    return pause()
  }
}

export const play = () => {
  console.debug('Player: playing')
  return TrackPlayer.play()
}

export const pause = async () => {
  console.debug('Player: pausing')
  await TrackPlayer.pause()
  return seekRelative(-1)
}

export const seekTo = async (position, chapter) => {
  console.debug('Player: seeking to', position)

  useStore.setState({
    position: position,
    buffered: 0,
    currentChapter:
      chapter || findChapter(position, useStore.getState().media.chapters)
  })
  await TrackPlayer.seekTo(position)

  return updateServerPosition()
}

export const seekRelativeThrottled = (() => {
  let seekTimerRef

  return interval => {
    useStore.setState({ isSeeking: true })

    // seek and update state
    const [destination, chapter] = seekRelativeState(interval)

    // throttle actually seeking TrackPlayer
    clearTimeout(seekTimerRef)
    seekTimerRef = setTimeout(() => {
      useStore.setState({ isSeeking: false })
      seekTo(destination, chapter)
    }, 500)
  }
})()

export const seekRelative = interval => seekTo(...seekRelativeState(interval))

export const destroy = () => {
  useStore.setState({ trackPlayerReady: false })
  return TrackPlayer.destroy()
}
