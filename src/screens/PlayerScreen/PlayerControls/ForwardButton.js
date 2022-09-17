import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React from 'react'
import { Text } from 'react-native'
import { TouchableNativeFeedback } from 'react-native-gesture-handler'
import tw from '../../../lib/tailwind'

export default function ForwardButton({ onPress }) {
  return (
    <TouchableNativeFeedback
      onPress={onPress}
      background={TouchableNativeFeedback.Ripple(tw.color('gray-400'), true)}
    >
      <FontAwesomeIcon icon="forward" color={tw.color('gray-100')} size={32} />
      <Text style={tw`text-gray-400 text-center`}>1 min</Text>
    </TouchableNativeFeedback>
  )
}
