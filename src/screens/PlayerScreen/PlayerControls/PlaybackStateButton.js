import React, { useEffect, useState } from 'react'
import { TouchableNativeFeedback } from 'react-native-gesture-handler'
import { State, usePlaybackState } from 'react-native-track-player'
import PauseButton from '../../../components/PauseButton'
import PlayButton from '../../../components/PlayButton'
import tw from '../../../lib/tailwind'

function Button({ playing }) {
  return playing ? <PauseButton /> : <PlayButton size={64} />
}

export default function PlaybackStateButton({ onPress }) {
  const playbackState = usePlaybackState()
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    playbackState === State.Playing ? setPlaying(true) : setPlaying(false)
  }, [playbackState])

  return (
    <TouchableNativeFeedback
      onPress={onPress}
      background={TouchableNativeFeedback.Ripple(tw.color('gray-400'), true)}
    >
      <Button playing={playing} />
    </TouchableNativeFeedback>
  )
}
