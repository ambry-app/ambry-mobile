import React from 'react'
import { Text } from 'react-native'

import tw from '../lib/tailwind'

export default function PlayerScreen () {
  return (
    <Text style={tw`text-lg font-semibold text-gray-500`}>
      Personal Audiobook Streaming
    </Text>
  )
}
