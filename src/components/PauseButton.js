import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React from 'react'
import tw from '../lib/tailwind'

export default function PauseButton() {
  return <FontAwesomeIcon icon="pause" color={tw.color('gray-100')} size={64} />
}
