import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React from 'react'
import { Text, useColorScheme } from 'react-native'
import { TouchableNativeFeedback } from 'react-native-gesture-handler'
import tw from '../../../lib/tailwind'

export default function BackButton({ onPress }) {
  const scheme = useColorScheme()

  return (
    <TouchableNativeFeedback
      onPress={onPress}
      background={TouchableNativeFeedback.Ripple(tw.color('gray-400'), true)}
    >
      <FontAwesomeIcon
        icon="backward"
        color={scheme === 'dark' ? tw.color('gray-100') : tw.color('gray-700')}
        size={32}
      />
      <Text style={tw`text-gray-400 text-center`}>1 min</Text>
    </TouchableNativeFeedback>
  )
}
