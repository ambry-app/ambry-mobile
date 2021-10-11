const BASE_URL = `http://192.168.0.8:4000`
const API_URL = `${BASE_URL}/api`

async function handleResponse (response) {
  if (response.ok) {
    const result = await response.json()
    return result.data
  } else {
    return Promise.reject(response)
  }
}

export async function getRecentBooks (page = 1, token) {
  const response = await fetch(`${API_URL}/books?page=${page}`, {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
}

export async function getBook (bookId, token) {
  const response = await fetch(`${API_URL}/books/${bookId}`, {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
}

export async function getPerson (personId, token) {
  const response = await fetch(`${API_URL}/people/${personId}`, {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
}

export async function getSeries (seriesId, token) {
  const response = await fetch(`${API_URL}/series/${seriesId}`, {
    headers: { Authorization: 'Bearer ' + token }
  })
  return handleResponse(response)
}

export async function createToken (email, password) {
  const response = await fetch(`${API_URL}/log_in`, {
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

export function imageSource (path, token) {
  return {
    uri: `${BASE_URL}/${path}`,
    headers: {
      Authorization: 'Bearer ' + token
    }
  }
}
