import React from 'react'
import { useColorScheme } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'

import tw from '../lib/tailwind'

import RecentBooksScreen from '../screens/RecentBooksScreen'
import BookDetailsScreen from '../screens/BookDetailsScreen'
import PersonDetailsScreen from '../screens/PersonDetailsScreen'
import SeriesScreen from '../screens/SeriesScreen'
import PlayerScreen from '../screens/PlayerScreen'

import ContinueListening from '../components/ContinueListening'
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

const Drawer = createDrawerNavigator()

const PlayerDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={({ navigation }) => (
        <ContinueListening navigation={navigation} />
      )}
      screenOptions={{
        drawerType: 'back'
      }}
    >
      <Drawer.Screen
        name='PlayerScreen'
        options={{ headerShown: false }}
        component={PlayerScreen}
      />
    </Drawer.Navigator>
  )
}

export const AppStack = () => {
  const scheme = useColorScheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelPosition: 'beside-icon',
        tabBarInactiveTintColor:
          scheme == 'dark' ? tw.color('gray-50') : tw.color('gray-700')
      }}
    >
      <Tab.Screen
        name='PlayerDrawer'
        options={{
          title: 'Player',
          tabBarIcon: ({ color, size }) => (
            <PlayButton
              width={size}
              height={size}
              iconColor={color}
              ringColor={color}
            />
          ),
          tabBarStyle: tw.style('absolute h-12 opacity-85')
        }}
        component={PlayerDrawer}
      />
      <Tab.Screen
        name='Library'
        options={{
          tabBarIcon: ({ color, size }) => (
            <Library width={size} height={size} iconColor={color} />
          ),
          tabBarStyle: tw.style('h-12')
        }}
        component={LibraryStack}
      />
    </Tab.Navigator>
  )
}
