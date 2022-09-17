import { GraphQLClient } from 'graphql-request'
import { useCallback } from 'react'
import EncryptedStorage from 'react-native-encrypted-storage'
import create from 'zustand'
import { persist } from 'zustand/middleware'
import {
  MediaWithPlayerStateDocument,
  UpdatePlayerStateDocument,
  useBookQuery,
  useInfiniteBooksQuery,
  useInfinitePlayerStatesQuery,
  useInfiniteSearchQuery,
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

const { getState, setState } = useStore

export default useStore

// Private state mutators:

function setLoggedInState(host, token, email) {
  const { knownHosts } = getState()
  const newAuthData = { host, token, email }

  setState({
    _authData: newAuthData,
    loggedIn: true,
    knownHosts: [...new Set([host, ...knownHosts])]
  })
}

function setLoggedOutState() {
  setState({
    _authData: null,
    loggedIn: false
  })
}

// Utils:

function makeSource(_authData, path) {
  const { host, token } = _authData

  return {
    uri: `${host}/${path}`,
    headers: {
      authorization: `Bearer ${token}`
    }
  }
}

function makeClient(_authData, fallbackHost) {
  if (_authData) {
    const { uri, headers } = makeSource(_authData, 'gql')

    return new GraphQLClient(uri, { headers })
  } else if (fallbackHost) {
    const endpoint = `${fallbackHost}/gql`

    return new GraphQLClient(endpoint)
  }
}

// Hooks:

export const useSource = () => {
  const _authData = useStore(state => state._authData)

  return path => makeSource(_authData, path)
}

export const useClient = fallbackHost => {
  const _authData = useStore(state => state._authData)

  return makeClient(_authData, fallbackHost)
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

export const usePlayerStates = () => {
  const client = useClient()

  return useInfinitePlayerStatesQuery(
    'after',
    client,
    { first: 50 },
    {
      getNextPageParam: lastPage => {
        if (lastPage.playerStates.pageInfo.hasNextPage) {
          return { after: lastPage.playerStates.pageInfo.endCursor }
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

export const useSearch = query => {
  const client = useClient()

  return useInfiniteSearchQuery(
    'after',
    client,
    { first: 50, query },
    {
      getNextPageParam: lastPage => {
        if (lastPage.search.pageInfo.hasNextPage) {
          return { after: lastPage.search.pageInfo.endCursor }
        }
      }
    }
  )
}

// Non-hook calls:

export const source = path => {
  const { _authData } = getState()

  return makeSource(_authData, path)
}

export const getMediaWithPlayerState = async mediaId => {
  const { _authData } = getState()
  const client = makeClient(_authData)
  const data = await client.request(MediaWithPlayerStateDocument, {
    id: mediaId
  })

  return data.node
}

export const updatePlayerState = async (mediaId, state) => {
  const { _authData } = getState()
  const client = makeClient(_authData)
  const data = await client.request(UpdatePlayerStateDocument, {
    input: {
      mediaId: mediaId,
      ...state
    }
  })

  return data.updatePlayerState.playerState
}
