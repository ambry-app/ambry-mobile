import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import RNBootSplash from 'react-native-bootsplash'
import shallow from 'zustand/shallow'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'
import tw from '../lib/tailwind'
import useAmbryAPI from '../stores/AmbryAPI'
import { AppStack } from './AppStack'
import { AuthStack } from './AuthStack'

const Theme = {
  dark: true,
  colors: {
    primary: tw.color('lime-400'),
    background: tw.color('black'),
    card: tw.color('gray-900'),
    text: tw.color('gray-100'),
    border: tw.color('gray-600'),
    notification: tw.color('red-400')
  }
}

const linking = {
  prefixes: ['trackplayer://'],
  config: {
    screens: { PlayerRightDrawer: 'notification.click' }
  }
}

const apiSelector = [state => [state.loggedIn, state._hasHydrated], shallow]

export const Router = () => {
  const [loggedIn, ready] = useAmbryAPI(...apiSelector)

  if (!ready) {
    return (
      <ScreenCentered>
        <LargeActivityIndicator />
      </ScreenCentered>
    )
  }

  return (
    <NavigationContainer
      linking={linking}
      theme={Theme}
      onReady={() => RNBootSplash.hide()}
    >
      {loggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
