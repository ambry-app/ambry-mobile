import React, { useEffect } from 'react'
import { StatusBar, useColorScheme } from 'react-native'
import TrackPlayer, { Capability } from 'react-native-track-player'
import { init as initTransparentStatusBar } from 'react-native-transparent-status-and-navigation-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import tw from './lib/tailwind'
import { useDeviceContext } from 'twrnc'

import { AuthProvider } from './contexts/Auth'
import { Router } from './routes/Router'

initTransparentStatusBar()

async function setupIfNecessary () {
  const currentTrack = await TrackPlayer.getCurrentTrack()

  if (currentTrack !== null) {
    return
  }

  await TrackPlayer.setupPlayer({
    minBuffer: 180,
    maxBuffer: 300,
    backBuffer: 120
  })
  await TrackPlayer.updateOptions({
    stopWithApp: false,
    alwaysPauseOnInterruption: true,
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.JumpForward,
      Capability.JumpBackward,
      Capability.Stop
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.JumpBackward,
      Capability.JumpForward
    ],
    forwardJumpInterval: 10,
    backwardJumpInterval: 10
  })
}

export default function App () {
  const scheme = useColorScheme()

  useDeviceContext(tw)

  useEffect(() => {
    setupIfNecessary()
  }, [])

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
