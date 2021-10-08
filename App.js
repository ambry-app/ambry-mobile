import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import tw, { useDeviceContext } from 'twrnc'

import RecentBooksScreen from './screens/RecentBooksScreen'
import BookDetailsScreen from './screens/BookDetailsScreen'
import PersonDetailsScreen from './screens/PersonDetailsScreen'
import SeriesScreen from './screens/SeriesScreen'

const Stack = createNativeStackNavigator()

export default function App () {
  useDeviceContext(tw)

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Recent'>
        <Stack.Screen
          name='Recent'
          options={{ title: 'Newest books' }}
          component={RecentBooksScreen}
        />
        <Stack.Screen name='Book' component={BookDetailsScreen} />
        <Stack.Screen name='Person' component={PersonDetailsScreen} />
        <Stack.Screen name='Series' component={SeriesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
