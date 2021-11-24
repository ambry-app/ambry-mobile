import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { State, usePlaybackState } from 'react-native-track-player'
import PauseButton from '../../../components/PauseButton'
import PlayButton from '../../../components/PlayButton'

function Button({ playing }) {
  return playing ? (
    <PauseButton width={75} height={75} />
  ) : (
    <PlayButton width={75} height={75} />
  )
}

export default function PlaybackStateButton({ onPress }) {
  const playbackState = usePlaybackState()
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    playbackState == State.Playing ? setPlaying(true) : setPlaying(false)
  }, [playbackState])

  return (
    <TouchableOpacity onPress={onPress}>
      <Button playing={playing} />
    </TouchableOpacity>
  )
}
