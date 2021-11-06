import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { useColorScheme } from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import { Loading } from '../components/Loading'
import { useAuth } from '../contexts/Auth'
import tw from '../lib/tailwind'
import { AppStack } from './AppStack'
import { AuthStack } from './AuthStack'

const LightTheme = {
  dark: false,
  colors: {
    primary: tw.color('lime-500'),
    background: tw.color('gray-100'),
    card: tw.color('white'),
    text: tw.color('gray-700'),
    border: tw.color('gray-200'),
    notification: tw.color('red-500')
  }
}

const DarkTheme = {
  dark: true,
  colors: {
    primary: tw.color('lime-400'),
    background: tw.color('gray-900'),
    card: tw.color('gray-800'),
    text: tw.color('gray-50'),
    border: tw.color('gray-600'),
    notification: tw.color('red-400')
  }
}

const linking = {
  prefixes: ['trackplayer://'],
  config: { screens: { PlayerDrawer: 'notification.click' } }
}

export const Router = () => {
  const { authData, loading } = useAuth()
  const scheme = useColorScheme()

  if (loading) {
    return <Loading />
  }
  return (
    <NavigationContainer
      linking={linking}
      theme={scheme === 'dark' ? DarkTheme : LightTheme}
      onReady={() => RNBootSplash.hide()}
    >
      {authData ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
