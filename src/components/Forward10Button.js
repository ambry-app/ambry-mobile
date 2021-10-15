import React from 'react'
import { useColorScheme } from 'react-native'

import tw from '../lib/tailwind'

import Forward10 from '../assets/forward_10.svg'

export default function Forward10Button ({ width, height }) {
  const scheme = useColorScheme()

  return (
    <Forward10
      width={width}
      height={height}
      iconColor={scheme == 'dark' ? tw.color('gray-200') : tw.color('gray-700')}
    />
  )
}
