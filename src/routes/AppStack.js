import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  createDrawerNavigator,
  useDrawerStatus
} from '@react-navigation/drawer'
import { useIsFocused } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React, { useEffect } from 'react'
import { Text, useWindowDimensions, View } from 'react-native'
import { TouchableNativeFeedback } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LeftDrawerContents from '../components/LeftDrawerContents'
import RightDrawerContents from '../components/RightDrawerContents'
import { useEnhancedDrawerStatus } from '../hooks/enhancedDrawerStatus'
import tw from '../lib/tailwind'
import BookDetailsScreen from '../screens/BookDetailsScreen'
import PersonDetailsScreen from '../screens/PersonDetailsScreen'
import PlayerScreen from '../screens/PlayerScreen'
import RecentBooksScreen from '../screens/RecentBooksScreen'
import SeriesScreen from '../screens/SeriesScreen'
import usePlayer from '../stores/Player'

const Stack = createNativeStackNavigator()

const PlayerScreenWrapper = ({ navigation }) => {
  const { width } = useWindowDimensions()
  const isDrawerOpen = useDrawerStatus() === 'open'
  const setTabBarVisible = usePlayer(state => state.setTabBarVisible)
  const isFocused = useIsFocused()
  const drawerStatus = useEnhancedDrawerStatus()

  useEffect(() => {
    setTabBarVisible(['opening', 'open'].includes(drawerStatus) || !isFocused)
  }, [isFocused, drawerStatus, setTabBarVisible])

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

  return <PlayerScreen />
}

const LibraryStack = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Recent"
        options={{ title: 'Latest books' }}
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
        name="Player"
        options={{ headerShown: false }}
        component={PlayerScreenWrapper}
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
      <RightDrawer.Screen
        name="PlayerLeftDrawer"
        component={LeftDrawerScreen}
      />
    </RightDrawer.Navigator>
  )
}

function iconForRoute(route) {
  switch (route.name) {
    case 'PlayerRightDrawer':
      return 'circle-play'
    case 'Library':
      return 'book-open'
    case 'Search':
      return 'magnifying-glass'
    case 'Settings':
      return 'gear'
  }
}

const Tab = createBottomTabNavigator()

function TabBar({ state, descriptors, navigation }) {
  const tabBarVisible = usePlayer(s => s.tabBarVisible)
  const position = useSharedValue(0)
  const { bottom } = useSafeAreaInsets()

  useEffect(() => {
    if (tabBarVisible) {
      position.value = withTiming(0, { duration: 200 })
    } else {
      position.value = withTiming(64, { duration: 150 })
    }
  }, [tabBarVisible, position])

  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: position.value }]
    }
  }, [tabBarVisible])

  return (
    <Animated.View
      style={[
        tw`bg-gray-800 flex-row absolute bottom-0 left-0 h-16 w-full`,
        style
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true
          })

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, merge: true })
          }
        }

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key
          })
        }

        return (
          <View key={index} style={tw`flex-grow`}>
            <TouchableNativeFeedback
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
            >
              <View
                style={[
                  tw`h-full items-center justify-center`,
                  { paddingBottom: bottom }
                ]}
              >
                <FontAwesomeIcon
                  icon={iconForRoute(route)}
                  size={24}
                  color={isFocused ? tw.color('lime-400') : 'white'}
                />
              </View>
            </TouchableNativeFeedback>
          </View>
        )
      })}
    </Animated.View>
  )
}

function FakeScreen() {
  return (
    <View>
      <Text>Fake</Text>
    </View>
  )
}

export const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <TabBar {...props} />}
    >
      <Tab.Screen name="PlayerRightDrawer" component={RightDrawerScreen} />
      <Tab.Screen name="Library" component={LibraryStack} />
      <Tab.Screen name="Search" component={FakeScreen} />
      <Tab.Screen name="Settings" component={FakeScreen} />
    </Tab.Navigator>
  )
}
