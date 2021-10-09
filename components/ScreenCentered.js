import React from 'react'
import { View } from 'react-native'

import tw from '../lib/tailwind'

export default function ScreenCentered ({ children }) {
  return (
    <View style={tw.style('items-center justify-center', { flex: 1 })}>
      {children}
    </View>
  )
}
