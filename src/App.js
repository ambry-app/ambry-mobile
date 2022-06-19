import React from 'react'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useDeviceContext } from 'twrnc'
import tw from './lib/tailwind'
import { Router } from './routes/Router'
import { SystemBars } from 'react-native-bars'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons/faCirclePlay'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons/faBookOpen'
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass'

library.add(faCirclePlay, faBookOpen, faBars, faGear, faMagnifyingGlass)

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
