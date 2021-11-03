import React from 'react'
import { useColorScheme, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import tw from '../../lib/tailwind'

export default function PlayerHeader ({ children }) {
  const scheme = useColorScheme()
  const { top: topMargin } = useSafeAreaInsets()

  return (
    <View
      style={tw.style(tw`p-4 shadow-sm bg-gray-100/85 dark:bg-gray-800/85`, {
        paddingTop: topMargin + tw.style('pt-4').paddingTop
      })}
    >
      {children}
    </View>
  )
}
