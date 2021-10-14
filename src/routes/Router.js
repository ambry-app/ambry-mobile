import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import RNBootSplash from 'react-native-bootsplash'

import { AppStack } from './AppStack'
import { AuthStack } from './AuthStack'
import { useAuth } from '../contexts/Auth'
import { Loading } from '../components/Loading'

export const Router = () => {
  const { authData, loading } = useAuth()

  if (loading) {
    return <Loading />
  }
  return (
    <NavigationContainer onReady={() => RNBootSplash.hide()}>
      {authData ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
