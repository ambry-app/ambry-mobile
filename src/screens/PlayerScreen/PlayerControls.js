import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native'
import shallow from 'zustand/shallow'
import tw from '../../lib/tailwind'
import usePlayer, {
  seekRelativeThrottled,
  seekTo,
  togglePlayback
} from '../../stores/Player'
import Back10Button from './PlayerControls/Back10Button'
import BackButton from './PlayerControls/BackButton'
import ChapterControls from './PlayerControls/ChapterControls'
import Forward10Button from './PlayerControls/Forward10Button'
import ForwardButton from './PlayerControls/ForwardButton'
import PlaybackStateButton from './PlayerControls/PlaybackStateButton'
import Scrubber from './PlayerControls/Scrubber'

const playerSelector = [state => [state.position, state.media], shallow]

const ScrubberWrapper = () => {
  const scheme = useColorScheme()
  const [position, media] = usePlayer(...playerSelector)
  const { chapters, duration } = media

  const markers = chapters.map(chapter => Math.round(chapter.startTime / 5) * 5)

  const theme =
    scheme === 'dark'
      ? {
          accent: tw.color('lime-400'),
          strong: tw.color('gray-200'),
          emphasized: tw.color('gray-300'),
          normal: tw.color('gray-400'),
          dimmed: tw.color('gray-500'),
          weak: tw.color('gray-800')
        }
      : {
          accent: tw.color('lime-500'),
          strong: tw.color('gray-800'),
          emphasized: tw.color('gray-600'),
          normal: tw.color('gray-500'),
          dimmed: tw.color('gray-400'),
          weak: tw.color('gray-300')
        }

  return (
    <Scrubber
      position={position}
      duration={duration}
      onChange={seekTo}
      markers={markers}
      theme={theme}
    />
  )
}

export default function PlayerControls({ toggleChapters }) {
  // console.log('RENDERING: PlayerControls')
  const tabBarHeight = useBottomTabBarHeight()

  return (
    <View style={[tw`flex-col`, styles.flex]}>
      <View style={tw`flex-grow bg-gray-100/85 dark:bg-gray-900/85`}>
        <View style={[tw`flex-col`, styles.flex]}>
          <ChapterControls toggleChapters={toggleChapters} />
          <View style={tw`flex-grow`}>
            <View style={[tw`flex-col justify-center`, styles.flex]}>
              <View
                style={tw`flex-row items-center justify-around px-12 mb-14`}
              >
                <TouchableOpacity onPress={() => seekRelativeThrottled(-10)}>
                  <Back10Button width={34} height={39} />
                </TouchableOpacity>
                <PlaybackStateButton onPress={() => togglePlayback()} />
                <TouchableOpacity onPress={() => seekRelativeThrottled(10)}>
                  <Forward10Button width={34} height={39} />
                </TouchableOpacity>
              </View>
              <View style={tw`flex-row items-center justify-around px-12`}>
                <TouchableOpacity onPress={() => seekRelativeThrottled(-60)}>
                  <BackButton width={42} height={27} />
                  <Text style={tw`text-gray-400 text-center`}>1 min</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => seekRelativeThrottled(60)}>
                  <ForwardButton width={42} height={27} />
                  <Text style={tw`text-gray-400 text-center`}>1 min</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <ScrubberWrapper />
        </View>
      </View>
      <View style={{ height: tabBarHeight }} />
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 }
})
