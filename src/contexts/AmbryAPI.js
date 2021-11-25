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

const setReady = state => ({
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

      setState(pipe(setSession(authData), setReady))
    } else {
      console.debug('AmbryAPI: No session present in EncryptedStorage')

      setState(pipe(clearSession, setReady))
    }
  } catch (error) {
    console.error(
      'AmbryAPI: Failed to get userSession from EncryptedStorage',
      error
    )

    setState(pipe(clearSession, setReady))
  }
}

const doAPICall = async (signOut, apiFunc, ...args) => {
  try {
    return await apiFunc(...args)
  } catch (error) {
    if (error === 401) {
      signOut()
    } else {
      console.warn('AmbryAPI: Unhandled API call error', error)
    }
    throw error
  }
}

const AmbryAPIProvider = ({ children }) => {
  const isFirstRender = useFirstRender()
  const [state, setState] = useState(initialState)
  const { authData, loggedIn, ready } = state

  // Authentication actions
  const signIn = useCallback(async (host, email, password) => {
    console.debug('AmbryAPI: Signing in with the server')

    const { token } = await createToken(host, email, password)
    const newAuthData = { host, email, token }

    console.debug(`AmbryAPI: Signed in as ${email} at host ${host}`)

    setState(setSession(newAuthData))
    EncryptedStorage.setItem('userSession', JSON.stringify(newAuthData))
  }, [])

  const signOut = useCallback(() => {
    console.debug('AmbryAPI: Signing out')

    // TODO: call signOut in API so it also invalidates the session server-side.
    // TODO: keep email and host and restore them in the sign-in form for
    // convenience.
    setState(clearSession)
    EncryptedStorage.removeItem('userSession')
  }, [])

  // API calls
  const getRecentBooks = useCallback(
    page => doAPICall(signOut, API.getRecentBooks, authData, page),
    [authData, signOut]
  )

  const getRecentPlayerStates = useCallback(
    page => doAPICall(signOut, API.getRecentPlayerStates, authData, page),
    [authData, signOut]
  )

  const getBook = useCallback(
    bookId => doAPICall(signOut, API.getBook, authData, bookId),
    [authData, signOut]
  )

  const getPerson = useCallback(
    personId => doAPICall(signOut, API.getPerson, authData, personId),
    [authData, signOut]
  )

  const getSeries = useCallback(
    seriesId => doAPICall(signOut, API.getSeries, authData, seriesId),
    [authData, signOut]
  )

  const getPlayerState = useCallback(
    mediaId => doAPICall(signOut, API.getPlayerState, authData, mediaId),
    [authData, signOut]
  )

  const listBookmarks = useCallback(
    page => doAPICall(signOut, API.listBookmarks, authData, page),
    [authData, signOut]
  )

  const reportPlayerState = useCallback(
    stateReport =>
      doAPICall(signOut, API.reportPlayerState, authData, stateReport),
    [authData, signOut]
  )

  const uriSource = useCallback(
    path => API.uriSource(authData, path),
    [authData]
  )

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

function useAmbryAPI() {
  const context = useContext(AmbryAPIContext)

  if (!context) {
    throw new Error('useAmbryAPI must be used within an AmbryAPIProvider')
  }

  return context
}

export { AmbryAPIContext, AmbryAPIProvider, useAmbryAPI }
