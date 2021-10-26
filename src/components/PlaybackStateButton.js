import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import { State, usePlaybackState } from 'react-native-track-player'

import tw from '../lib/tailwind'

import LargeActivityIndicator from './LargeActivityIndicator'
import PlayButton from './PlayButton'
import PauseButton from './PauseButton'

const loadingStates = [State.None, State.Buffering, State.Connecting]

function Button ({ playbackState }) {
  return playbackState === State.Playing ? (
    <PauseButton width={75} height={75} />
  ) : (
    <PlayButton width={75} height={75} />
  )
}

export default function PlaybackStateButton ({ onPress }) {
  const playbackState = usePlaybackState()

  if (loadingStates.includes(playbackState)) {
    return (
      <View width={75} height={75} style={tw`justify-center`}>
        <LargeActivityIndicator />
      </View>
    )
  } else {
    return (
      <TouchableOpacity onPress={onPress}>
        <Button playbackState={playbackState} />
      </TouchableOpacity>
    )
  }
}
