import React from 'react'
import { useColorScheme } from 'react-native'
import Back from '../../../assets/back.svg'
import tw from '../../../lib/tailwind'

export default function BackButton({ width, height }) {
  const scheme = useColorScheme()

  return (
    <Back
      width={width}
      height={height}
      iconColor={scheme == 'dark' ? tw.color('gray-200') : tw.color('gray-700')}
    />
  )
}
