import React from 'react'
import { ActivityIndicator, useColorScheme } from 'react-native'

import tw from '../lib/tailwind'

export default function LargeActivityIndicator ({ style }) {
  const scheme = useColorScheme()

  return (
    <ActivityIndicator
      style={style}
      animating={true}
      size='large'
      color={scheme == 'dark' ? tw.color('gray-200') : tw.color('gray-700')}
    />
  )
}
