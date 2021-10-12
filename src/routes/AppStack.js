import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import RecentBooksScreen from '../screens/RecentBooksScreen'
import BookDetailsScreen from '../screens/BookDetailsScreen'
import PersonDetailsScreen from '../screens/PersonDetailsScreen'
import SeriesScreen from '../screens/SeriesScreen'
import PlayerScreen from '../screens/PlayerScreen'

const Stack = createNativeStackNavigator()

export const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='Recent'
        options={{ title: 'Newest books' }}
        component={RecentBooksScreen}
      />
      <Stack.Screen
        name='Book'
        options={{ title: 'Book details' }}
        component={BookDetailsScreen}
      />
      <Stack.Screen
        name='Person'
        options={{ title: 'Person details' }}
        component={PersonDetailsScreen}
      />
      <Stack.Screen name='Series' component={SeriesScreen} />
      <Stack.Screen name='Player' component={PlayerScreen} />
    </Stack.Navigator>
  )
}
