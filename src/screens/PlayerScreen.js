import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import React, { useRef } from 'react'
import { Text, View } from 'react-native'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'
import usePlayerState from '../hooks/playerState'
import tw from '../lib/tailwind'
import Background from './PlayerScreen/Background'
import BookDetails from './PlayerScreen/BookDetails'
import {
  Bookmarks,
  BookmarksToggle,
  useBookmarks
} from './PlayerScreen/Bookmarks'
import PlaybackRate from './PlayerScreen/PlaybackRate'
import PlayerControls from './PlayerScreen/PlayerControls'
import PlayerHeader from './PlayerScreen/PlayerHeader'
import ProgressDisplay from './PlayerScreen/ProgressDisplay'

export default function PlayerScreen () {
  const {
    state: {
      error,
      loading,
      loadingTrack,
      media,
      imageSource,
      playbackRate,
      playerState
    },
    actions: { setPlaybackRate, seekRelative, seekTo, togglePlayback }
  } = usePlayerState()
  const bookmarksRef = useRef()
  const { onBookmarksChange, toggleBookmarks } = useBookmarks(
    bookmarksRef,
    loading
  )

  if (loading) {
    return (
      <ScreenCentered>
        <LargeActivityIndicator />
      </ScreenCentered>
    )
  }

  if (error) {
    return (
      <ScreenCentered>
        <Text style={tw`text-gray-700 dark:text-gray-200`}>
          Failed to load player!
        </Text>
      </ScreenCentered>
    )
  }

  // it was explicitly set to null; this means there is no current player state
  if (media === null) {
    return (
      <ScreenCentered>
        <Text style={tw`text-gray-700 dark:text-gray-200`}>
          No audiobook selected. Visit the Library to choose a book.
        </Text>
      </ScreenCentered>
    )
  }

  // undefined (must be about to load)
  if (!media) {
    return null
  }

  return (
    <BottomSheetModalProvider>
      <Background imageSource={imageSource}>
        <PlayerHeader>
          <BookDetails imageSource={imageSource} media={media} />
          <ProgressDisplay
            playerState={playerState}
            loadingTrack={loadingTrack}
            playbackRate={playbackRate}
          />
          <View style={tw`flex-row`}>
            <BookmarksToggle click={toggleBookmarks} />
            <View style={tw`flex-grow`} />
            <PlaybackRate
              playbackRate={playbackRate}
              setPlaybackRate={setPlaybackRate}
            />
          </View>
        </PlayerHeader>
        <PlayerControls
          media={media}
          seekRelative={seekRelative}
          seekTo={seekTo}
          togglePlayback={togglePlayback}
          playerState={playerState}
          loadingTrack={loadingTrack}
        />
      </Background>
      <Bookmarks
        sheetRef={bookmarksRef}
        onChange={onBookmarksChange}
        seek={seekTo}
      />
    </BottomSheetModalProvider>
  )
}
