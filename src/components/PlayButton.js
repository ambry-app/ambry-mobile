import React from 'react'
import { useColorScheme } from 'react-native'

import tw from '../lib/tailwind'

import Play from '../assets/play.svg'

export default function PlayButton ({ width, height, iconColor, ringColor }) {
  const scheme = useColorScheme()

  return (
    <Play
      width={width}
      height={height}
      ringColor={
        ringColor ||
        (scheme == 'dark' ? tw.color('gray-500') : tw.color('gray-300'))
      }
      iconColor={
        iconColor ||
        (scheme == 'dark' ? tw.color('gray-200') : tw.color('gray-700'))
      }
    />
  )
}
