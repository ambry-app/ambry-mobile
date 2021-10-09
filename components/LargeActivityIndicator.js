import React from 'react'
import { ActivityIndicator } from 'react-native'

import tw from '../lib/tailwind'

export default function LargeActivityIndicator () {
  return (
    <ActivityIndicator
      animating={true}
      size='large'
      color={tw.color('gray-700')}
    />
  )
}
