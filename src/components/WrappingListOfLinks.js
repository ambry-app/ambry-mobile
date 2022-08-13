import React from 'react'
import { Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
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
  const lastIndex = items.length - 1
  const links = items.map((item, index) => (
    <TouchableOpacity
      key={keyExtractor(item)}
      onPress={() => onPressLink(item)}
    >
      <Text style={linkStyle}>
        {nameExtractor(item)}
        {index !== lastIndex ? ', ' : null}
      </Text>
    </TouchableOpacity>
  ))

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
