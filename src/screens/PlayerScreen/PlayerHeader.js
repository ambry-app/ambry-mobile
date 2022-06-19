import React from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import tw from '../../lib/tailwind'

export default function PlayerHeader({ children }) {
  const { top: topMargin } = useSafeAreaInsets()

  return (
    <View
      style={tw.style(tw`p-4 bg-white/85 dark:bg-gray-800/85`, {
        paddingTop: topMargin
      })}
    >
      {children}
    </View>
  )
}
