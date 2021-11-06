import { useDebounce } from '@react-hook/debounce'
import React, { useEffect } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { State, usePlaybackState } from 'react-native-track-player'
import LargeActivityIndicator from '../../../components/LargeActivityIndicator'
import PauseButton from '../../../components/PauseButton'
import PlayButton from '../../../components/PlayButton'
import tw from '../../../lib/tailwind'

const loadingStates = [State.None, State.Buffering, State.Connecting]

function Button ({ playbackState }) {
  return playbackState === State.Playing ? (
    <PauseButton width={75} height={75} />
  ) : (
    <PlayButton width={75} height={75} />
  )
}

export default function PlaybackStateButton ({ onPress, loadingTrack }) {
  const playbackState = usePlaybackState()
  const [debouncedState, setDebouncedState] = useDebounce(State.None, 15)

  useEffect(() => {
    setDebouncedState(loadingTrack ? State.Buffering : playbackState)
  }, [playbackState, loadingTrack])

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
