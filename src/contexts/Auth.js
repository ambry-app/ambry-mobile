import React, { createContext, useState, useContext, useEffect } from 'react'
import EncryptedStorage from 'react-native-encrypted-storage'

import { authService } from '../services/authService'

const AuthContext = createContext({})

const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStorageData()
  }, [])

  async function loadStorageData () {
    try {
      const userSession = await EncryptedStorage.getItem('userSession')

      if (userSession) {
        const _authData = JSON.parse(userSession)
        setAuthData(_authData)
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (host, email, password) => {
    const _authData = await authService.signIn(host, email, password)

    setAuthData(_authData)

    await EncryptedStorage.setItem('userSession', JSON.stringify(_authData))
  }

  const signOut = async () => {
    // TODO: call signOut in API so it also invalidates the session server-side.
    // TODO: keep email and host and restore them in the sign-in form for
    // convenience.
    setAuthData(undefined)

    await EncryptedStorage.removeItem('userSession')
  }

  return (
    <AuthContext.Provider value={{ authData, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth () {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export { AuthContext, AuthProvider, useAuth }
