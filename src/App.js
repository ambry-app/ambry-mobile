import React from 'react'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useDeviceContext } from 'twrnc'
import tw from './lib/tailwind'
import { Router } from './routes/Router'
import { SystemBars } from 'react-native-bars'

export default function App() {
  const scheme = useColorScheme()

  useDeviceContext(tw)

  return (
    <SafeAreaProvider>
      <SystemBars
        animated={true}
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <Router />
    </SafeAreaProvider>
  )
}
