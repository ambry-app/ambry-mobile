import { createDrawerNavigator } from '@react-navigation/drawer'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import DrawerContents from '../components/DrawerContents'
import tw from '../lib/tailwind'
import BookDetailsScreen from '../screens/BookDetailsScreen'
import PersonDetailsScreen from '../screens/PersonDetailsScreen'
import PlayerScreen from '../screens/PlayerScreen'
import RecentBooksScreen from '../screens/RecentBooksScreen'
import SeriesScreen from '../screens/SeriesScreen'

const Stack = createNativeStackNavigator()

const MainStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Player"
        options={{ headerShown: false }}
        component={PlayerScreen}
      />
      <Stack.Screen
        name="Recent"
        options={{ title: 'Newest books' }}
        component={RecentBooksScreen}
      />
      <Stack.Screen
        name="Book"
        options={{ title: 'Book details' }}
        component={BookDetailsScreen}
      />
      <Stack.Screen
        name="Person"
        options={{ title: 'Person details' }}
        component={PersonDetailsScreen}
      />
      <Stack.Screen name="Series" component={SeriesScreen} />
    </Stack.Navigator>
  )
}

const Drawer = createDrawerNavigator()

const NavDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={({ navigation }) => (
        <DrawerContents navigation={navigation} />
      )}
      screenOptions={{
        drawerType: 'back',
        drawerStyle: tw`bg-gray-100 dark:bg-gray-900 w-5/6`,
        // NOTE: -150 is a rough guess of the height of the scrubber
        gestureHandlerProps: { hitSlop: { bottom: -150 } }
      }}
    >
      <Drawer.Screen
        name="MainStack"
        options={{ headerShown: false }}
        component={MainStack}
      />
    </Drawer.Navigator>
  )
}

export const AppStack = () => {
  return <NavDrawer />
}
