import React from 'react'
import { Text } from 'react-native'

import tw from '../lib/tailwind'

export function Header1 ({ children, style }) {
  return <Text style={[tw`text-4xl text-gray-700`, style]}>{children}</Text>
}

export function Header2 ({ children, style }) {
  return <Text style={[tw`text-3xl text-gray-700`, style]}>{children}</Text>
}

export function Header4 ({ children, style }) {
  return <Text style={[tw`text-xl text-gray-700`, style]}>{children}</Text>
}
