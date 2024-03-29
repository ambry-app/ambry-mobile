import React from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import tw from '../../lib/tailwind'

export default function PlayerHeader({ children }) {
  const { top: topMargin } = useSafeAreaInsets()

  return (
    <View
      style={tw.style(tw`p-4 bg-gray-900/85`, {
        paddingTop: topMargin
      })}
    >
      {children}
    </View>
  )
}
