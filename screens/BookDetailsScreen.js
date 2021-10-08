import React from 'react'
import { Text, View } from 'react-native'

export default function BookDetailsScreen ({ route }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Book Screen {route.params.bookId}</Text>
    </View>
  )
}
