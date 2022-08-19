import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useNavigation } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { Platform, Text, View } from 'react-native'
import { TouchableNativeFeedback } from 'react-native-gesture-handler'
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
  const navigation = useNavigation()
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

  const animatedOpacity = useAnimatedStyle(() => {
    return { opacity: opacity.value }
  })

  if (error) {
    return (
      <ScreenCentered>
        <Text style={tw`text-gray-200`}>Failed to load player!</Text>
      </ScreenCentered>
    )
  }

  if (loading && imageSource) {
    return (
      <Background loading={loading} imageSource={imageSource} blur={0}>
        <ScreenCentered>
          <View
            style={tw`flex items-center justify-center w-14 h-14 rounded-full bg-gray-800`}
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
        <Text style={tw`text-gray-200 mb-4`}>
          No audiobook selected. Visit the library to choose a book:
        </Text>
        <TouchableNativeFeedback
          onPress={() => navigation.navigate('Library', { screen: 'Recent' })}
          background={TouchableNativeFeedback.Ripple(
            tw.color('gray-400'),
            true
          )}
        >
          <FontAwesomeIcon
            icon="book-open"
            size={48}
            color={tw.color('lime-400')}
          />
        </TouchableNativeFeedback>
      </ScreenCentered>
    )
  }

  return (
    <Background
      imageSource={imageSource}
      blur={Platform.OS === 'ios' ? 25 : 10}
    >
      <Animated.View style={animatedOpacity}>
        <View style={tw`h-full`}>
          <PlayerHeader>
            <BookDetails imageSource={imageSource} media={media} />
            <ProgressDisplay />
            <View style={tw`flex-row items-center -ml-2`}>
              <SleepTimerToggle />
              <View style={tw`flex-grow`} />
              <PlaybackRate />
            </View>
          </PlayerHeader>
          <PlayerControls />
        </View>
      </Animated.View>
    </Background>
  )
}
