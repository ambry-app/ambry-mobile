import React from 'react'
import { useColorScheme } from 'react-native'
import PlusCircle from '../assets/plus_circle.svg'
import tw from '../lib/tailwind'

export default function PlusCircleButton ({ width, height }) {
  const scheme = useColorScheme()

  return (
    <PlusCircle
      width={width}
      height={height}
      iconColor={scheme == 'dark' ? tw.color('lime-500') : tw.color('lime-400')}
    />
  )
}
