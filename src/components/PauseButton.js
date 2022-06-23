import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React from 'react'
import { useColorScheme } from 'react-native'
import tw from '../lib/tailwind'

export default function PauseButton() {
  const scheme = useColorScheme()

  return (
    <FontAwesomeIcon
      icon="pause"
      color={scheme === 'dark' ? tw.color('gray-100') : tw.color('gray-700')}
      size={64}
    />
  )
}
