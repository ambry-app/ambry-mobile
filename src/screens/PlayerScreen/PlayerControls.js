import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import tw from '../../lib/tailwind'
import Back10Button from './PlayerControls/Back10Button'
import BackButton from './PlayerControls/BackButton'
import ChapterControls from './PlayerControls/ChapterControls'
import Forward10Button from './PlayerControls/Forward10Button'
import ForwardButton from './PlayerControls/ForwardButton'
import PlaybackStateButton from './PlayerControls/PlaybackStateButton'
import Scrubber from './PlayerControls/Scrubber'

export default function PlayerControls ({
  seekRelative,
  seekTo,
  togglePlayback,
  position,
  duration,
  // toggleChapters,
  currentChapter
}) {
  const tabBarHeight = useBottomTabBarHeight()

  return (
    <View style={[tw`flex-col`, { flex: 1 }]}>
      <View style={tw`flex-grow bg-gray-100/85 dark:bg-gray-900/85`}>
        <View style={[tw`flex-col`, { flex: 1 }]}>
          <ChapterControls
            currentChapter={currentChapter}
            // toggleChapters={toggleChapters}
          />
          <View style={tw`flex-grow`}>
            <View style={[tw`flex-col justify-center`, { flex: 1 }]}>
              <View
                style={tw`flex-row items-center justify-around px-12 mb-14`}
              >
                <TouchableOpacity onPress={() => seekRelative(-10)}>
                  <Back10Button width={34} height={39} />
                </TouchableOpacity>
                <PlaybackStateButton onPress={() => togglePlayback()} />
                <TouchableOpacity onPress={() => seekRelative(10)}>
                  <Forward10Button width={34} height={39} />
                </TouchableOpacity>
              </View>
              <View style={tw`flex-row items-center justify-around px-12`}>
                <TouchableOpacity onPress={() => seekRelative(-60)}>
                  <BackButton width={42} height={27} />
                  <Text style={tw`text-gray-400 text-center`}>1 min</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => seekRelative(60)}>
                  <ForwardButton width={42} height={27} />
                  <Text style={tw`text-gray-400 text-center`}>1 min</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Scrubber position={position} duration={duration} onChange={seekTo} />
        </View>
      </View>
      <View style={{ height: tabBarHeight }}></View>
    </View>
  )
}
