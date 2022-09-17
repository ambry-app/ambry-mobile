import React from 'react'
import { StyleSheet, View } from 'react-native'
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

const playerSelector = [
  state => [state.position, state.media, state.playbackRate],
  shallow
]

const ScrubberWrapper = () => {
  const [position, media, playbackRate] = usePlayer(...playerSelector)

  if (!media) return null

  const { chapters, duration } = media

  const markers = chapters.map(chapter => Math.round(chapter.startTime / 5) * 5)

  const theme = {
    accent: tw.color('lime-400'),
    strong: tw.color('gray-100'),
    emphasized: tw.color('gray-200'),
    normal: tw.color('gray-400'),
    dimmed: tw.color('gray-500'),
    weak: tw.color('gray-800')
  }

  return (
    <View style={tw`pb-12 pt-2 bg-gray-900/85`}>
      <Scrubber
        position={position}
        duration={duration}
        playbackRate={playbackRate}
        onChange={seekTo}
        markers={markers}
        theme={theme}
      />
    </View>
  )
}

export default function PlayerControls() {
  // console.log('RENDERING: PlayerControls')

  return (
    <View style={[tw`flex-col`, styles.flex]}>
      <View style={tw`flex-grow bg-black/85`}>
        <View style={[tw`flex-col`, styles.flex]}>
          <ChapterControls />
          <View style={tw`flex-grow`}>
            <View style={[tw`flex-col justify-center`, styles.flex]}>
              <View
                style={tw`flex-row items-center justify-around px-12 mb-14`}
              >
                <Back10Button onPress={() => seekRelativeThrottled(-10)} />
                <PlaybackStateButton onPress={() => togglePlayback()} />
                <Forward10Button onPress={() => seekRelativeThrottled(10)} />
              </View>
              <View style={tw`flex-row items-center justify-around px-12`}>
                <BackButton onPress={() => seekRelativeThrottled(-60)} />
                <ForwardButton onPress={() => seekRelativeThrottled(60)} />
              </View>
            </View>
          </View>
        </View>
      </View>
      <ScrubberWrapper />
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 }
})
