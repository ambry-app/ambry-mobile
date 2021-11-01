import React from 'react'
import { StatusBar, useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { init as initTransparentStatusBar } from 'react-native-transparent-status-and-navigation-bar'
import { useDeviceContext } from 'twrnc'
import { AuthProvider } from './contexts/Auth'
import tw from './lib/tailwind'
import { Router } from './routes/Router'

initTransparentStatusBar()

export default function App () {
  const scheme = useColorScheme()

  useDeviceContext(tw)

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar
          translucent={true}
          backgroundColor={'transparent'}
          barStyle={scheme == 'dark' ? 'light-content' : 'dark-content'}
        />
        <Router />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
