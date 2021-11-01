import React from 'react'
import { useColorScheme } from 'react-native'
import Pause from '../assets/pause.svg'
import tw from '../lib/tailwind'

export default function PauseButton ({ width, height }) {
  const scheme = useColorScheme()

  return (
    <Pause
      width={width}
      height={height}
      ringColor={scheme == 'dark' ? tw.color('gray-500') : tw.color('gray-300')}
      iconColor={scheme == 'dark' ? tw.color('gray-200') : tw.color('gray-700')}
    />
  )
}
