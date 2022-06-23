import React from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import tw from '../lib/tailwind'

export default function SafeBottomBorder({ children }) {
  const { bottom } = useSafeAreaInsets()

  return (
    <View
      style={[
        tw`border-white dark:border-gray-900`,
        { borderBottomWidth: bottom }
      ]}
    >
      {children}
    </View>
  )
}
