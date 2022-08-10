import EncryptedStorage from 'react-native-encrypted-storage'
import create from 'zustand'
import { persist } from 'zustand/middleware'
import API, { createSession, deleteSession } from '../api/ambry'

const AUTH_STORAGE_KEY = '@Ambry_userSession'

// Store:

const useStore = create(
  persist(
    () => ({
      loggedIn: false,
      knownHosts: [],
      _authData: undefined,
      _hasHydrated: false
    }),
    {
      name: AUTH_STORAGE_KEY,
      getStorage: () => EncryptedStorage,
      // only persist these values:
      partialize: state => ({
        loggedIn: state.loggedIn,
        knownHosts: state.knownHosts,
        _authData: state._authData
      }),
      onRehydrateStorage: _initialState => {
        console.debug('AmbryAPI: Hydrating')

        return (_state, error) => {
          if (error) {
            console.error('AmbryAPI: An error happened during hydration', error)
          } else {
            useStore.setState({ _hasHydrated: true })
            console.debug('AmbryAPI: Hydration finished')
          }
        }
      }
    }
  )
)

export default useStore

// Actions:

export const signIn = async (host, email, password) => {
  console.debug('AmbryAPI: Signing in with the server')

  const { knownHosts } = useStore.getState()
  const { token, email: serverEmail } = await createSession(
    host,
    email,
    password
  )
  const newAuthData = { host, token, email: serverEmail }

  console.debug(`AmbryAPI: Signed in as ${email} at host ${host}`)

  useStore.setState({
    _authData: newAuthData,
    loggedIn: true,
    knownHosts: [...new Set([host, ...knownHosts])]
  })
}

export const signOut = async () => {
  console.debug('AmbryAPI: Signing out')

  deleteSession(useStore.getState()._authData)
  // TODO: keep email and host and restore them in the sign-in form for
  // convenience.
  useStore.setState({
    _authData: null,
    loggedIn: false
  })
}

export const fetchBooks = async ({ pageParam }) => {
  console.debug(`AmbryAPI: Fetching books`)

  return API.fetchBooks(useStore.getState()._authData, pageParam)
}

export const doAPICall = async (apiFunc, ...args) => {
  try {
    return await apiFunc(useStore.getState()._authData, ...args)
  } catch (error) {
    if (error === 401) {
      signOut()
    } else {
      console.warn('AmbryAPI: Unhandled API call error', error)
    }
    throw error
  }
}

export const getRecentPlayerStates = page =>
  doAPICall(API.getRecentPlayerStates, page)
export const getBook = bookId => doAPICall(API.getBook, bookId)
export const getPerson = personId => doAPICall(API.getPerson, personId)
export const getSeries = seriesId => doAPICall(API.getSeries, seriesId)
export const getPlayerState = mediaId => doAPICall(API.getPlayerState, mediaId)
export const listBookmarks = page => doAPICall(API.listBookmarks, page)
export const reportPlayerState = stateReport =>
  doAPICall(API.reportPlayerState, stateReport)
export const uriSource = path =>
  API.uriSource(useStore.getState()._authData, path)
