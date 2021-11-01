import React from 'react'
import { Text } from 'react-native'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'
import { usePlayer } from '../contexts/Player'
import tw from '../lib/tailwind'
import Background from './PlayerScreen/Background'
import BookDetails from './PlayerScreen/BookDetails'
import PlaybackRate from './PlayerScreen/PlaybackRate'
import PlayerControls from './PlayerScreen/PlayerControls'
import PlayerHeader from './PlayerScreen/PlayerHeader'
import ProgressDisplay from './PlayerScreen/ProgressDisplay'

export default function PlayerScreen () {
  const { media, loadingMedia, error } = usePlayer()

  if (loadingMedia) {
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
    <Background>
      <PlayerHeader>
        <BookDetails />
        <ProgressDisplay />
        <PlaybackRate />
      </PlayerHeader>
      <PlayerControls />
    </Background>
  )
}
