import { useCallback } from 'react'
import { GraphQLClient } from 'graphql-request'
import EncryptedStorage from 'react-native-encrypted-storage'
import create from 'zustand'
import { persist } from 'zustand/middleware'
import API from '../api/ambry'
import {
  useBookQuery,
  useInfiniteBooksQuery,
  useInfiniteSeriesBooksQuery,
  useLoginMutation,
  useLogoutMutation,
  usePersonQuery,
  useSeriesQuery
} from '../graphql/types-and-hooks'

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

// Private state mutators:

function setLoggedInState(host, token, email) {
  const { knownHosts } = useStore.getState()
  const newAuthData = { host, token, email }

  useStore.setState({
    _authData: newAuthData,
    loggedIn: true,
    knownHosts: [...new Set([host, ...knownHosts])]
  })
}

function setLoggedOutState() {
  useStore.setState({
    _authData: null,
    loggedIn: false
  })
}

// Hooks:

const useClient = fallbackHost => {
  const _authData = useStore(state => state._authData)

  if (_authData) {
    const { host, token } = _authData
    const endpoint = `${host}/gql`
    const headers = { authorization: `Bearer ${token}` }

    return new GraphQLClient(endpoint, { headers })
  } else if (fallbackHost) {
    const endpoint = `${fallbackHost}/gql`

    return new GraphQLClient(endpoint)
  }
}

export const useLoginAction = (host, email, password) => {
  const client = useClient(host)

  const { isLoading, isError, mutate } = useLoginMutation(client, {
    onSuccess: data => {
      setLoggedInState(host, data.login.token, data.login.user.email)
    }
  })

  const login = useCallback(() => {
    mutate({ input: { email, password } })
  }, [email, password, mutate])

  return { isLoading, isError, login }
}

export const useLogoutAction = () => {
  const client = useClient()

  const { mutate } = useLogoutMutation(client, {
    onSuccess: setLoggedOutState
  })

  return { logout: mutate }
}

export const useBooks = () => {
  const client = useClient()

  return useInfiniteBooksQuery(
    'after',
    client,
    { first: 50 },
    {
      getNextPageParam: lastPage => {
        if (lastPage.books.pageInfo.hasNextPage) {
          return { after: lastPage.books.pageInfo.endCursor }
        }
      }
    }
  )
}

export const useSeriesBooks = id => {
  const client = useClient()

  return useInfiniteSeriesBooksQuery(
    'after',
    client,
    { id, first: 50 },
    {
      getNextPageParam: lastPage => {
        if (lastPage.node.seriesBooks.pageInfo.hasNextPage) {
          return { after: lastPage.node.seriesBooks.pageInfo.endCursor }
        }
      }
    }
  )
}

export const useBook = id => {
  const client = useClient()

  return useBookQuery(client, { id })
}

export const usePerson = id => {
  const client = useClient()

  return usePersonQuery(client, { id, previewBooks: 25 })
}

export const useSeries = id => {
  const client = useClient()

  return useSeriesQuery(client, { id })
}

export const doAPICall = async (apiFunc, ...args) => {
  try {
    return await apiFunc(useStore.getState()._authData, ...args)
  } catch (error) {
    if (error === 401) {
      // signOut()
    } else {
      console.warn('AmbryAPI: Unhandled API call error', error)
    }
    throw error
  }
}

export const getRecentPlayerStates = page =>
  doAPICall(API.getRecentPlayerStates, page)
export const getPlayerState = mediaId => doAPICall(API.getPlayerState, mediaId)
export const reportPlayerState = stateReport =>
  doAPICall(API.reportPlayerState, stateReport)
export const uriSource = path =>
  API.uriSource(useStore.getState()._authData, path)
