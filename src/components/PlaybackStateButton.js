import React, { useEffect } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useDebounce } from '@react-hook/debounce'

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
  const [debouncedState, setDebouncedState] = useDebounce(State.None, 10)

  useEffect(() => {
    setDebouncedState(playbackState)
  }, [playbackState])

  if (loadingStates.includes(debouncedState)) {
    return (
      <View width={75} height={75} style={tw`justify-center`}>
        <LargeActivityIndicator />
      </View>
    )
  } else {
    return (
      <TouchableOpacity onPress={onPress}>
        <Button playbackState={debouncedState} />
      </TouchableOpacity>
    )
  }
}
