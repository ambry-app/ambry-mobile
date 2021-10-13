import React, { useEffect } from 'react'
import TrackPlayer, { Capability } from 'react-native-track-player'

import tw from './lib/tailwind'
import { useDeviceContext } from 'twrnc'

import { AuthProvider } from './contexts/Auth'
import { Router } from './routes/Router'

async function setupIfNecessary () {
  const currentTrack = await TrackPlayer.getCurrentTrack()

  if (currentTrack !== null) {
    return
  }

  await TrackPlayer.setupPlayer({})
  await TrackPlayer.updateOptions({
    stopWithApp: false,
    alwaysPauseOnInterruption: true,
    capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    compactCapabilities: [Capability.Play, Capability.Pause],
    backBuffer: 120
  })
}

export default function App () {
  useDeviceContext(tw)

  useEffect(() => {
    setupIfNecessary()
  }, [])

  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
