import { pipe } from 'ramda'
import React, { createContext, useCallback, useContext, useState } from 'react'
import EncryptedStorage from 'react-native-encrypted-storage'
import API, { createToken } from '../api/ambry'
import useFirstRender from '../hooks/firstRender'

const AmbryAPIContext = createContext({})

const initialState = {
  authData: undefined,
  loggedIn: false,
  ready: false
}

const setSession = authData => state => ({
  ...state,
  authData: authData,
  loggedIn: true
})

const clearSession = state => ({
  ...state,
  authData: null,
  loggedIn: false
})

const ready = state => ({
  ...state,
  ready: true
})

const loadSessionFromStorage = async setState => {
  console.debug('AmbryAPI: Loading session from EncryptedStorage')
  try {
    const userSession = await EncryptedStorage.getItem('userSession')

    if (userSession) {
      const authData = JSON.parse(userSession)

      console.debug('AmbryAPI: Restored session from EncryptedStorage')

      setState(pipe(setSession(authData), ready))
    } else {
      console.debug('AmbryAPI: No session present in EncryptedStorage')

      setState(pipe(clearSession, ready))
    }
  } catch (error) {
    console.error(
      'AmbryAPI: Failed to get userSession from EncryptedStorage',
      error
    )

    setState(pipe(clearSession, ready))
  }
}

const doSignIn = setState => async (host, email, password) => {
  console.debug('AmbryAPI: Signing in with the server')

  const { token } = await createToken(host, email, password)
  const authData = { host, email, token }

  console.debug(`AmbryAPI: Signed in as ${email} at host ${host}`)

  setState(setSession(authData))
  EncryptedStorage.setItem('userSession', JSON.stringify(authData))
}

const doSignOut = setState => () => {
  console.debug('AmbryAPI: Signing out')

  // TODO: call signOut in API so it also invalidates the session server-side.
  // TODO: keep email and host and restore them in the sign-in form for
  // convenience.
  setState(clearSession)
  EncryptedStorage.removeItem('userSession')
}

const useAPICallback = (func, setState, deps) => {
  return useCallback(async (...args) => {
    try {
      return await func(...args)
    } catch (error) {
      if (error === 401) {
        doSignOut(setState)
      } else {
        console.warn('AmbryAPI: Unhandled API call error', error)
      }
      throw error
    }
  }, deps)
}

const AmbryAPIProvider = ({ children }) => {
  const isFirstRender = useFirstRender()
  const [state, setState] = useState(initialState)
  const { authData, loggedIn, ready } = state

  // Authentication actions
  const signIn = useCallback(doSignIn(setState), [])
  const signOut = useCallback(doSignOut(setState), [])

  // API calls
  const getRecentBooks = useAPICallback(
    page => API.getRecentBooks(authData, page),
    setState,
    [authData]
  )

  const getRecentPlayerStates = useAPICallback(
    page => API.getRecentPlayerStates(authData, page),
    setState,
    [authData]
  )

  const getBook = useAPICallback(
    bookId => API.getBook(authData, bookId),
    setState,
    [authData]
  )

  const getPerson = useAPICallback(
    personId => API.getPerson(authData, personId),
    setState,
    [authData]
  )

  const getSeries = useAPICallback(
    seriesId => API.getSeries(authData, seriesId),
    setState,
    [authData]
  )

  const getPlayerState = useAPICallback(
    mediaId => API.getPlayerState(authData, mediaId),
    setState,
    [authData]
  )

  const listBookmarks = useAPICallback(
    page => API.listBookmarks(authData, page),
    setState,
    [authData]
  )

  const reportPlayerState = useAPICallback(
    stateReport => API.reportPlayerState(authData, stateReport),
    setState,
    [authData]
  )

  const uriSource = useCallback(path => API.uriSource(authData, path), [
    authData
  ])

  const contextValue = {
    loggedIn,
    ready,
    // Authentication actions
    signIn,
    signOut,
    // API calls
    getRecentBooks,
    getRecentPlayerStates,
    getBook,
    getPerson,
    getSeries,
    getPlayerState,
    listBookmarks,
    reportPlayerState,
    uriSource
  }

  if (isFirstRender) {
    loadSessionFromStorage(setState)
  }

  return (
    <AmbryAPIContext.Provider value={contextValue}>
      {children}
    </AmbryAPIContext.Provider>
  )
}

function useAmbryAPI () {
  const context = useContext(AmbryAPIContext)

  if (!context) {
    throw new Error('useAmbryAPI must be used within an AmbryAPIProvider')
  }

  return context
}

export { AmbryAPIContext, AmbryAPIProvider, useAmbryAPI }
