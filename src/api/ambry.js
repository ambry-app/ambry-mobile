function apiUrl (host, path) {
  return `${host}/api/${path}`
}

async function handleResponse (response) {
  if (response.ok) {
    const result = await response.json()
    return result.data
  } else {
    return Promise.reject(response.status)
  }
}

export async function getRecentBooks ({ host, token }, page = 1) {
  const response = await fetch(apiUrl(host, `books?page=${page}`), {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
}

export async function getBook ({ host, token }, bookId) {
  const response = await fetch(apiUrl(host, `books/${bookId}`), {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
}

export async function getPerson ({ host, token }, personId) {
  const response = await fetch(apiUrl(host, `people/${personId}`), {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
}

export async function getSeries ({ host, token }, seriesId) {
  const response = await fetch(apiUrl(host, `series/${seriesId}`), {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
}

export async function createToken (host, email, password) {
  const response = await fetch(apiUrl(host, 'log_in'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: {
        email: email,
        password: password
      }
    })
  })

  return handleResponse(response)
}

export function imageSource ({ host, token }, path) {
  return {
    uri: `${host}/${path}`,
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
}
