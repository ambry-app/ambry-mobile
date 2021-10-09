import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import tw from '../lib/tailwind'

export default function WrappingListOfLinks ({
  prefix,
  items,
  keyExtractor = item => item.id,
  nameExtractor = item => item.name,
  navigationArgsExtractor,
  style,
  linkStyle
}) {
  const navigation = useNavigation()

  const links = items
    .map(item => (
      <TouchableOpacity
        key={keyExtractor(item)}
        onPress={() => navigation.push(...navigationArgsExtractor(item))}
      >
        <Text style={linkStyle}>{nameExtractor(item)}</Text>
      </TouchableOpacity>
    ))
    .flatMap((e, i) => [
      <Text key={'comma-' + i} style={style}>
        ,{' '}
      </Text>,
      e
    ])
    .slice(1)

  const prefixElement = prefix ? (
    <Text key='prefix' style={style}>
      {prefix}{' '}
    </Text>
  ) : null

  return (
    <View style={tw`flex-row flex-wrap`}>
      {prefixElement}
      {links}
    </View>
  )
}
