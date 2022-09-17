import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React from 'react'
import tw from '../lib/tailwind'

export default function PlayButton({ size }) {
  return (
    <FontAwesomeIcon icon="play" color={tw.color('gray-100')} size={size} />
  )
}
