import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import React, { useEffect, useRef } from 'react'
import { Platform, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import shallow from 'zustand/shallow'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'
import tw from '../lib/tailwind'
import usePlayer from '../stores/Player'
import Background from './PlayerScreen/Background'
import BookDetails from './PlayerScreen/BookDetails'
import PlaybackRate from './PlayerScreen/PlaybackRate'
import PlayerControls from './PlayerScreen/PlayerControls'
import {
  Chapters,
  useChapters
} from './PlayerScreen/PlayerControls/ChapterControls'
import PlayerHeader from './PlayerScreen/PlayerHeader'
import ProgressDisplay from './PlayerScreen/ProgressDisplay'
import SleepTimerToggle from './PlayerScreen/SleepTimerToggle'

const playerSelector = [
  state => [
    state.mediaError,
    state.mediaLoading,
    state.media,
    state.imageSource,
    state._hasHydrated
  ],
  shallow
]

export default function PlayerScreen() {
  // console.log('RENDERING: PlayerScreen')
  const [error, loading, media, imageSource, hydrated] = usePlayer(
    ...playerSelector
  )
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (loading) {
      opacity.value = 0
    } else {
      opacity.value = withTiming(1, { duration: 200 })
    }
  }, [opacity, loading])

  const animatedStyle = useAnimatedStyle(() => {
    return { opacity: opacity.value }
  })

  const chaptersRef = useRef()
  const { chaptersOpen, onChaptersChange, toggleChapters } = useChapters(
    chaptersRef,
    loading
  )

  if (error) {
    return (
      <ScreenCentered>
        <Text style={tw`text-gray-700 dark:text-gray-200`}>
          Failed to load player!
        </Text>
      </ScreenCentered>
    )
  }

  if (loading && imageSource) {
    return (
      <Background loading={loading} imageSource={imageSource} blur={0}>
        <ScreenCentered>
          <View
            style={tw`flex items-center justify-center w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800`}
          >
            <LargeActivityIndicator />
          </View>
        </ScreenCentered>
      </Background>
    )
  }

  if (loading || !hydrated) {
    return (
      <ScreenCentered>
        <LargeActivityIndicator />
      </ScreenCentered>
    )
  }

  if (!media) {
    return (
      <ScreenCentered>
        <Text style={tw`text-gray-700 dark:text-gray-200`}>
          No audiobook selected. Visit the Library to choose a book.
        </Text>
      </ScreenCentered>
    )
  }

  return (
    <BottomSheetModalProvider>
      <Background
        imageSource={imageSource}
        blur={Platform.OS === 'ios' ? 25 : 10}
      >
        <Animated.View style={animatedStyle}>
          <View style={tw`h-full`}>
            <PlayerHeader>
              <BookDetails imageSource={imageSource} media={media} />
              <ProgressDisplay />
              <View style={tw`flex-row items-center`}>
                <SleepTimerToggle />
                <View style={tw`flex-grow`} />
                <PlaybackRate />
              </View>
            </PlayerHeader>
            <PlayerControls toggleChapters={toggleChapters} />
          </View>
        </Animated.View>
      </Background>
      <Chapters
        sheetRef={chaptersRef}
        onChange={onChaptersChange}
        isOpen={chaptersOpen}
      />
    </BottomSheetModalProvider>
  )
}
