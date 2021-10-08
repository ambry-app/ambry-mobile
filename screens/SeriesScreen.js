import React from 'react'
import { Text, View } from 'react-native'

export default function SeriesScreen ({ route }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Series Screen {route.params.seriesId}</Text>
    </View>
  )
}
