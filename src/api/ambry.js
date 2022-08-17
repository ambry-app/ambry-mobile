function apiUrl(host, path) {
  return `${host}/api/${path}`
}

async function handleResponse(response, withHasMore = false) {
  if (response.ok) {
    const result = await response.json()
    return withHasMore ? [result.data, result.hasMore] : result.data
  } else {
    throw response.status
  }
}

export async function getPlayerState({ host, token }, mediaId) {
  const response = await fetch(apiUrl(host, `player_states/${mediaId}`), {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
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

export function uriSource({ host, token }, path) {
  return {
    uri: `${host}/${path}`,
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
}

export default {
  getPlayerState,
  reportPlayerState,
  uriSource
}
