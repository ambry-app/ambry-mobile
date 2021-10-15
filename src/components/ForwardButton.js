import React from 'react'
import { useColorScheme } from 'react-native'

import tw from '../lib/tailwind'

import Forward from '../assets/forward.svg'

export default function ForwardButton ({ width, height }) {
  const scheme = useColorScheme()

  return (
    <Forward
      width={width}
      height={height}
      iconColor={scheme == 'dark' ? tw.color('gray-200') : tw.color('gray-700')}
    />
  )
}
