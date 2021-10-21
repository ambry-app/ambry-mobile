import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import tw from '../lib/tailwind'

import RecentBooksScreen from '../screens/RecentBooksScreen'
import BookDetailsScreen from '../screens/BookDetailsScreen'
import PersonDetailsScreen from '../screens/PersonDetailsScreen'
import SeriesScreen from '../screens/SeriesScreen'
import PlayerScreen from '../screens/PlayerScreen'

import PlayButton from '../components/PlayButton'
import Library from '../assets/library.svg'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const LibraryStack = () => {
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
    </Stack.Navigator>
  )
}

export const AppStack = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name='Player'
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <PlayButton
              width={size}
              height={size}
              iconColor={color}
              ringColor={color}
            />
          ),
          tabBarLabelPosition: 'beside-icon',
          tabBarStyle: tw.style('absolute h-12 opacity-85')
        }}
        component={PlayerScreen}
      />
      <Tab.Screen
        name='Library'
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Library width={size} height={size} iconColor={color} />
          ),
          tabBarLabelPosition: 'beside-icon',
          tabBarStyle: tw.style('h-12')
        }}
        component={LibraryStack}
      />
    </Tab.Navigator>
  )
}
