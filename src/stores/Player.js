import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import TrackPlayer, {
  Capability,
  PitchAlgorithm,
  TrackType
} from 'react-native-track-player'
import create from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import shallow from 'zustand/shallow'
import { isPlaying } from '../lib/utils'
import { getMediaWithPlayerState, updatePlayerState } from '../stores/AmbryAPI'
import SleepTimer from '../stores/SleepTimer'
import { source } from './AmbryAPI'

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
  state => [state._hasHydrated, state.selectedMedia],
  ([hydrated, selectedMedia]) => {
    if (hydrated) {
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

const setupTrackPlayer = async () => {
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

// Calculate relative seek position based on current state
// NOTE: this assumes the state is up-to-date (it won't be if calling from a
// background service)
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

// Calculate relative seek position based on fresh position information from
// TrackPlayer. Use this when the state might not be up-to-date.
const seekRelativeFresh = async interval => {
  const [playbackRate, position] = await Promise.all([
    TrackPlayer.getRate(),
    TrackPlayer.getPosition()
  ])
  const { media } = useStore.getState()

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
  if (!selectedMedia) {
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
      imageSource: source(selectedMedia.imagePath),
      playbackRate: null
    })

    console.debug(
      `Player: loading playerState for media ${selectedMedia.id} from server`
    )
    const media = await getMediaWithPlayerState(selectedMedia.id)

    console.debug('Player: media with playerState loaded', media)
    loadTrackIntoPlayer(media)
  } catch (err) {
    console.error('Player: failed to load media with playerState', err)
    useStore.setState({
      mediaLoading: false,
      mediaError: true
    })
  }
}

const loadTrackIntoPlayer = async media => {
  await setupTrackPlayer()

  const mediaTrack = mediaTrackForPlatform(media)
  const { uri: artworkUrl, headers } = source(media.book.imagePath)

  const currentTrack = await TrackPlayer.getTrack(0)

  if (currentTrack && currentTrack.description === media.id) {
    // the current track is already loaded; nothing to do
    console.debug('Player: track already loaded')

    const [currentPosition, currentPlaybackRate] = await Promise.all([
      TrackPlayer.getPosition(),
      TrackPlayer.getRate()
    ])

    const chapter = findChapter(currentPosition, media.chapters)

    useStore.setState({
      mediaLoading: false,
      media: media,
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
      duration: media.duration,
      title: media.book.title,
      artist: media.book.authors.map(author => author.name).join(', '),
      artwork: artworkUrl,
      description: media.id,
      headers
    })

    await TrackPlayer.seekTo(media.playerState.position)
    await TrackPlayer.setRate(media.playerState.playbackRate)

    const chapter = findChapter(media.playerState.position, media.chapters)

    useStore.setState({
      mediaLoading: false,
      media: media,
      position: media.playerState.position,
      buffered: 0,
      currentChapter: chapter,
      playbackRate: media.playerState.playbackRate
    })
  }
}

const mediaTrackForPlatform = media => {
  const path = Platform.OS === 'ios' ? media.hlsPath : media.mpdPath
  const type = Platform.OS === 'ios' ? TrackType.HLS : TrackType.Dash
  const { uri: url } = source(path)

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
  try {
    const [position, track] = await Promise.all([
      TrackPlayer.getPosition(),
      TrackPlayer.getTrack(0)
    ])

    const mediaId = track.description

    console.debug('Player: updating server position', { mediaId, position })
    return updatePlayerState(mediaId, { position })
  } catch {
    console.debug('Player: updateServerPosition called while no track loaded')
  }
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

export const setLoadingImage = async imagePath => {
  useStore.setState({
    mediaLoading: true,
    media: undefined,
    imageSource: source(imagePath),
    playbackRate: null
  })
}

export const setPlaybackRate = async playbackRate => {
  console.debug('Player: setting playback rate', playbackRate)

  // set rate on player async
  TrackPlayer.setRate(playbackRate)

  // set rate state
  useStore.setState({ playbackRate })

  const track = await TrackPlayer.getTrack(0)

  if (!track) {
    console.warn('Player: setPlaybackRate called while no track loaded')
    return
  }

  const mediaId = track.description

  console.debug('Player: updating server playback rate', {
    mediaId,
    playbackRate
  })
  return updatePlayerState(mediaId, { playbackRate })
}

export const togglePlayback = async () => {
  console.debug('Player: toggling playback')

  const playbackState = await TrackPlayer.getState()

  if (isPlaying(playbackState)) {
    return pause()
  } else {
    return play()
  }
}

export const play = async () => {
  console.debug('Player: playing')

  SleepTimer.startIfEnabled()
  return TrackPlayer.play()
}

export const pause = async () => {
  console.debug('Player: pausing')

  SleepTimer.stopIfRunning()
  await TrackPlayer.pause()
  return seekRelative(-1)
}

export const stop = async () => {
  console.debug('Player: stopping')

  SleepTimer.stopIfRunning()
  await TrackPlayer.pause()
  return updateServerPosition()
}

export const seekTo = async (position, chapter) => {
  console.debug('Player: seeking to', position)

  useStore.setState({
    position: position,
    buffered: 0,
    currentChapter:
      chapter || findChapter(position, useStore.getState().media.chapters)
  })
  SleepTimer.resetIfRunning()
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

export const seekRelative = async interval =>
  seekTo(...(await seekRelativeFresh(interval)))

export const destroy = () => {
  console.debug('Player: clearing selected media and destroying player')

  useStore.setState({
    selectedMedia: null,
    trackPlayerReady: false
  })
  return TrackPlayer.destroy()
}

export const seekNextChapter = async () => {
  const { media, currentChapter } = useStore.getState()
  const chapters = media.chapters
  const index = chapters.indexOf(currentChapter)
  const nextChapter = chapters[index + 1]

  if (nextChapter) {
    return seekTo(nextChapter.startTime)
  } else {
    return seekTo(media.duration)
  }
}

export const seekPreviousChapter = async () => {
  const { media, currentChapter } = useStore.getState()
  const chapters = media.chapters
  const index = chapters.indexOf(currentChapter)
  const previousChapter = chapters[index - 1]

  if (previousChapter) {
    return seekTo(previousChapter.startTime)
  } else {
    return seekTo(0)
  }
}
