import React from 'react'
import { useColorScheme } from 'react-native'
import Forward from '../../../assets/forward.svg'
import tw from '../../../lib/tailwind'

export default function ForwardButton({ width, height }) {
  const scheme = useColorScheme()

  return (
    <Forward
      width={width}
      height={height}
      iconColor={scheme == 'dark' ? tw.color('gray-200') : tw.color('gray-700')}
    />
  )
}
