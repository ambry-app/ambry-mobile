import {
  createDrawerNavigator,
  useDrawerStatus
} from '@react-navigation/drawer'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import LeftDrawerContents from '../components/LeftDrawerContents'
import RightDrawerContents from '../components/RightDrawerContents'
import tw from '../lib/tailwind'
import BookDetailsScreen from '../screens/BookDetailsScreen'
import PersonDetailsScreen from '../screens/PersonDetailsScreen'
import PlayerScreen from '../screens/PlayerScreen'
import RecentBooksScreen from '../screens/RecentBooksScreen'
import SeriesScreen from '../screens/SeriesScreen'

const Stack = createNativeStackNavigator()

const MainStack = ({ navigation }) => {
  const { width } = useWindowDimensions()
  const isDrawerOpen = useDrawerStatus() === 'open'

  useEffect(() => {
    navigation.setOptions({
      gestureHandlerProps: {
        // NOTE: -150 is a rough guess of the height of the scrubber
        hitSlop: {
          left: 0,
          bottom: isDrawerOpen ? undefined : -150,
          width: isDrawerOpen ? undefined : width / 2
        }
      }
    })
  }, [navigation, width, isDrawerOpen])

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

const LeftDrawer = createDrawerNavigator()

const LeftDrawerScreen = ({ navigation }) => {
  const { width } = useWindowDimensions()
  const isDrawerOpen = useDrawerStatus() === 'open'

  useEffect(() => {
    navigation.setOptions({
      gestureHandlerProps: {
        // NOTE: -150 is a rough guess of the height of the scrubber
        hitSlop: {
          right: 0,
          bottom: isDrawerOpen ? undefined : -150,
          width: isDrawerOpen ? undefined : width / 2
        }
      }
    })
  }, [navigation, width, isDrawerOpen])

  return (
    <LeftDrawer.Navigator
      id="LeftDrawer"
      drawerContent={LeftDrawerContents}
      screenOptions={{
        drawerPosition: 'left',
        drawerType: 'back',
        drawerStyle: tw`bg-gray-900 w-5/6`
      }}
    >
      <LeftDrawer.Screen
        name="MainStack"
        options={{ headerShown: false }}
        component={MainStack}
      />
    </LeftDrawer.Navigator>
  )
}

const RightDrawer = createDrawerNavigator()

const RightDrawerScreen = () => {
  return (
    <RightDrawer.Navigator
      id="RightDrawer"
      drawerContent={RightDrawerContents}
      screenOptions={{
        drawerPosition: 'right',
        headerShown: false,
        drawerType: 'back',
        drawerStyle: tw`bg-gray-900 w-5/6`
      }}
    >
      <RightDrawer.Screen name="HomeDrawer" component={LeftDrawerScreen} />
    </RightDrawer.Navigator>
  )
}

export const AppStack = () => {
  return <RightDrawerScreen />
}
