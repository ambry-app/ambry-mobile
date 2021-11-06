import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import tw from '../../lib/tailwind'
import Back10Button from './PlayerControls/Back10Button'
import BackButton from './PlayerControls/BackButton'
import Forward10Button from './PlayerControls/Forward10Button'
import ForwardButton from './PlayerControls/ForwardButton'
import PlaybackStateButton from './PlayerControls/PlaybackStateButton'

export default function PlayerControls ({
  seekRelative,
  togglePlayback,
  loadingTrack
}) {
  const tabBarHeight = useBottomTabBarHeight()

  return (
    <View
      style={tw.style('justify-center bg-gray-100/85 dark:bg-gray-900/85', {
        flex: 1,
        marginBottom: tabBarHeight
      })}
    >
      <View style={tw`flex-row items-center justify-around px-12 mb-14`}>
        <TouchableOpacity onPress={() => seekRelative(-10)}>
          <Back10Button width={34} height={39} />
        </TouchableOpacity>
        <PlaybackStateButton
          onPress={() => togglePlayback()}
          loadingTrack={loadingTrack}
        />
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
  )
}
