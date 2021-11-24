import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import tw from '../lib/tailwind'

export default function WrappingListOfLinks({
  prefix,
  suffix,
  items,
  keyExtractor = item => item.id,
  nameExtractor = item => item.name,
  onPressLink,
  style,
  linkStyle
}) {
  const links = items
    .map(item => (
      <TouchableOpacity
        key={keyExtractor(item)}
        onPress={() => onPressLink(item)}
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
    <Text key="prefix" style={style}>
      {prefix}{' '}
    </Text>
  ) : null

  const suffixElement = suffix ? (
    <Text key="suffix" style={style}>
      {' '}
      {suffix}
    </Text>
  ) : null

  return (
    <View style={tw`flex-row flex-wrap`}>
      {prefixElement}
      {links}
      {suffixElement}
    </View>
  )
}
