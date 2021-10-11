import React from 'react'
import { ActivityIndicator } from 'react-native'

import tw from '../lib/tailwind'

export default function LargeActivityIndicator ({ style }) {
  return (
    <ActivityIndicator
      style={style}
      animating={true}
      size='large'
      color={tw.color('gray-700')}
    />
  )
}
