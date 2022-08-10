import request, { gql } from 'graphql-request'

function apiUrl(host, path) {
  return `${host}/api/${path}`
}

function gqlUrl(host, name) {
  return `${host}/gql/${name}`
}

async function handleResponse(response, withHasMore = false) {
  if (response.ok) {
    const result = await response.json()
    return withHasMore ? [result.data, result.hasMore] : result.data
  } else {
    throw response.status
  }
}

const booksQuery = gql`
  query Books($first: Int, $after: String) {
    books(first: $first, after: $after) {
      edges {
        node {
          id
          title
          imagePath
          authors {
            id
            name
            person {
              id
            }
          }
          seriesBooks {
            bookNumber
            series {
              id
              name
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`
async function fetchBooks({ host, token }, cursor) {
  const variables = cursor ? { first: 50, after: cursor } : { first: 50 }
  const requestHeaders = { authorization: `Bearer ${token}` }
  const data = await request(
    gqlUrl(
      host,
      cursor ? `Books(first:50,after:${cursor})` : `Books(first:50)`
    ),
    booksQuery,
    variables,
    requestHeaders
  )

  return data.books
}

export async function getRecentBooks({ host, token }, page = 1) {
  const response = await fetch(apiUrl(host, `books?page=${page}`), {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response, true)
}

export async function getRecentPlayerStates({ host, token }, page = 1) {
  const response = await fetch(apiUrl(host, `player_states?page=${page}`), {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response, true)
}

export async function getBook({ host, token }, bookId) {
  const response = await fetch(apiUrl(host, `books/${bookId}`), {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
}

export async function getPerson({ host, token }, personId) {
  const response = await fetch(apiUrl(host, `people/${personId}`), {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
}

export async function getSeries({ host, token }, seriesId) {
  const response = await fetch(apiUrl(host, `series/${seriesId}`), {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
}

export async function getPlayerState({ host, token }, mediaId) {
  const response = await fetch(apiUrl(host, `player_states/${mediaId}`), {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
}

export async function listBookmarks({ host, token }, mediaId, page = 1) {
  const response = await fetch(
    apiUrl(host, `bookmarks/${mediaId}?page=${page}`),
    {
      headers: { Authorization: 'Bearer ' + token }
    }
  )
  return handleResponse(response, true)
}

export async function reportPlayerState(
  { host, token },
  { id, position, playbackRate }
) {
  const body = {
    playerState: {
      position,
      playbackRate
    }
  }
  const response = await fetch(apiUrl(host, `player_states/${id}`), {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  return handleResponse(response)
}

const createSessionMutation = gql`
  mutation CreateSession($input: CreateSessionInput!) {
    createSession(input: $input) {
      token
      user {
        email
      }
    }
  }
`
export async function createSession(host, email, password) {
  const variables = { input: { email, password } }
  const data = await request(
    gqlUrl(host, 'CreateSession'),
    createSessionMutation,
    variables
  )

  const {
    createSession: {
      token,
      user: { email: serverEmail }
    }
  } = data

  return { token, email: serverEmail }
}

const deleteSessionMutation = gql`
  mutation DeleteSession {
    deleteSession {
      deleted
    }
  }
`
export async function deleteSession({ host, token }) {
  const requestHeaders = { authorization: `Bearer ${token}` }
  await request(
    gqlUrl(host, 'DeleteSession'),
    deleteSessionMutation,
    {},
    requestHeaders
  )

  return true
}

export function uriSource({ host, token }, path) {
  return {
    uri: `${host}/${path}`,
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
}

export default {
  fetchBooks,
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
