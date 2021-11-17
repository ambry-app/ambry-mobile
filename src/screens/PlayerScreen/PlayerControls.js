import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import React, { memo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { usePlayer } from '../../contexts/Player'
import tw from '../../lib/tailwind'
import Back10Button from './PlayerControls/Back10Button'
import BackButton from './PlayerControls/BackButton'
import ChapterControls from './PlayerControls/ChapterControls'
import Forward10Button from './PlayerControls/Forward10Button'
import ForwardButton from './PlayerControls/ForwardButton'
import PlaybackStateButton from './PlayerControls/PlaybackStateButton'
import Scrubber from './PlayerControls/Scrubber'

function ScrubberWrapper () {
  const { state, actions } = usePlayer()
  const { position, media } = state
  const { duration } = media
  const { seekTo } = actions

  return (
    <ActualScrubberWrapper
      position={position}
      duration={duration}
      seekTo={seekTo}
    />
  )
}

const ActualScrubberWrapper = memo(({ position, duration, seekTo }) => {
  return <Scrubber position={position} duration={duration} onChange={seekTo} />
})

export default function PlayerControls ({ toggleChapters }) {
  const { actions } = usePlayer()
  const { seekRelative, togglePlayback } = actions

  return (
    <ActualPlayerControls
      seekRelative={seekRelative}
      togglePlayback={togglePlayback}
      toggleChapters={toggleChapters}
    />
  )
}

const ActualPlayerControls = memo(
  ({ seekRelative, togglePlayback, toggleChapters }) => {
    // console.log('RENDERING: PlayerControls')
    const tabBarHeight = useBottomTabBarHeight()

    return (
      <View style={[tw`flex-col`, { flex: 1 }]}>
        <View style={tw`flex-grow bg-gray-100/85 dark:bg-gray-900/85`}>
          <View style={[tw`flex-col`, { flex: 1 }]}>
            <ChapterControls toggleChapters={toggleChapters} />
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
            <ScrubberWrapper />
          </View>
        </View>
        <View style={{ height: tabBarHeight }}></View>
      </View>
    )
  }
)
