import React, { useEffect } from 'react'
import { SystemBars } from 'react-native-bars'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useDeviceContext } from 'twrnc'
import tw from './lib/tailwind'
import { Router } from './routes/Router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faBackward } from '@fortawesome/free-solid-svg-icons/faBackward'
import { faBackwardStep } from '@fortawesome/free-solid-svg-icons/faBackwardStep'
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons/faBookOpen'
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons/faCirclePlay'
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
import { faForward } from '@fortawesome/free-solid-svg-icons/faForward'
import { faForwardStep } from '@fortawesome/free-solid-svg-icons/faForwardStep'
import { faGaugeHigh } from '@fortawesome/free-solid-svg-icons/faGaugeHigh'
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass'
import { faPause } from '@fortawesome/free-solid-svg-icons/faPause'
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons/faRotateLeft'
import { faRotateRight } from '@fortawesome/free-solid-svg-icons/faRotateRight'
import { faStopwatch } from '@fortawesome/free-solid-svg-icons/faStopwatch'
import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons/faVolumeHigh'
import NetInfo from '@react-native-community/netinfo'
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { AppState, Platform } from 'react-native'

library.add(
  faCirclePlay,
  faBookOpen,
  faBars,
  faGear,
  faMagnifyingGlass,
  faRotateLeft,
  faRotateRight,
  faPlay,
  faPause,
  faBackward,
  faForward,
  faStopwatch,
  faGaugeHigh,
  faVolumeHigh,
  faForwardStep,
  faBackwardStep,
  faDownload
)

onlineManager.setEventListener(setOnline => {
  return NetInfo.addEventListener(state => {
    setOnline(!!state.isConnected)
  })
})

function onAppStateChange(status) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active')
  }
}

const queryClient = new QueryClient()

export default function App() {
  useDeviceContext(tw)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange)

    return () => subscription.remove()
  }, [])

  return (
    <GestureHandlerRootView style={tw`flex-grow`}>
      <SystemBars animated={true} barStyle="light-content" />
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <Router />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
