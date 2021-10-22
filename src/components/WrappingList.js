import React from 'react'
import { Text, View } from 'react-native'

import tw from '../lib/tailwind'

export default function WrappingList ({
  prefix,
  items,
  keyExtractor = item => item.id,
  nameExtractor = item => item.name,
  style
}) {
  const links = items
    .map(item => (
      <Text key={keyExtractor(item)} style={style}>
        {nameExtractor(item)}
      </Text>
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
