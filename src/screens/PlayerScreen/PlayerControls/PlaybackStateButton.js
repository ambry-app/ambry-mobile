import { useDebounce } from '@react-hook/debounce'
import React, { useEffect } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { State, usePlaybackState } from 'react-native-track-player'
import LargeActivityIndicator from '../../../components/LargeActivityIndicator'
import PauseButton from '../../../components/PauseButton'
import PlayButton from '../../../components/PlayButton'
import tw from '../../../lib/tailwind'

function Button ({ playing }) {
  return playing ? (
    <PauseButton width={75} height={75} />
  ) : (
    <PlayButton width={75} height={75} />
  )
}

export default function PlaybackStateButton ({ onPress, loadingTrack }) {
  const playbackState = usePlaybackState()
  const [playing, setPlaying] = useDebounce(false, 25)

  useEffect(() => {
    playbackState == State.Playing ? setPlaying(true) : setPlaying(false)
  }, [playbackState])

  if (loadingTrack) {
    return (
      <View width={75} height={75} style={tw`justify-center`}>
        <LargeActivityIndicator />
      </View>
    )
  } else {
    return (
      <TouchableOpacity onPress={onPress}>
        <Button playing={playing} />
      </TouchableOpacity>
    )
  }
}
