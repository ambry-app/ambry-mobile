import React from 'react'
import { Text, View } from 'react-native'

export default function PersonDetailsScreen ({ route }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Person Screen {route.params.personId}</Text>
    </View>
  )
}
