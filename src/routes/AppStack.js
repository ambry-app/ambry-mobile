import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import { TouchableOpacity, useColorScheme } from 'react-native'
import Library from '../assets/library.svg'
import ContinueListening from '../components/ContinueListening'
import PlayButton from '../components/PlayButton'
import { PlayerProvider } from '../contexts/Player'
import tw from '../lib/tailwind'
import BookDetailsScreen from '../screens/BookDetailsScreen'
import PersonDetailsScreen from '../screens/PersonDetailsScreen'
import PlayerScreen from '../screens/PlayerScreen'
import RecentBooksScreen from '../screens/RecentBooksScreen'
import SeriesScreen from '../screens/SeriesScreen'

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

const TabNavigator = () => {
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
          tabBarStyle: tw`absolute shadow-none bg-gray-100/85 dark:bg-gray-800/85`,
          tabBarButton: props => <TouchableOpacity {...props} />
        }}
        component={PlayerDrawer}
      />
      <Tab.Screen
        name='Library'
        options={{
          lazy: false,
          tabBarIcon: ({ color, size }) => (
            <Library width={size} height={size} iconColor={color} />
          ),
          tabBarButton: props => <TouchableOpacity {...props} />
        }}
        component={LibraryStack}
      />
    </Tab.Navigator>
  )
}

export const AppStack = () => {
  return (
    <PlayerProvider>
      <TabNavigator />
    </PlayerProvider>
  )
}
