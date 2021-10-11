import React from 'react'

import tw from './lib/tailwind'
import { useDeviceContext } from 'twrnc'

import { AuthProvider } from './contexts/Auth'
import { Router } from './routes/Router'

export default function App () {
  useDeviceContext(tw)

  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
