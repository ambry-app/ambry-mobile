import React from 'react'
import { useColorScheme } from 'react-native'
import Play from '../assets/play.svg'
import tw from '../lib/tailwind'

export default function PlayButton ({ width, height, iconColor, ringColor }) {
  const scheme = useColorScheme()

  return (
    <Play
      width={width}
      height={height}
      ringColor={
        ringColor ||
        (scheme == 'dark' ? tw.color('gray-500') : tw.color('gray-400'))
      }
      iconColor={
        iconColor ||
        (scheme == 'dark' ? tw.color('gray-200') : tw.color('gray-700'))
      }
    />
  )
}
