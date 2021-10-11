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

export async function getRecentBooks (page = 1) {
  const response = await fetch(`${API_URL}/books?page=${page}`)
  return handleResponse(response)
}

export async function getBook (bookId) {
  const response = await fetch(`${API_URL}/books/${bookId}`)
  return handleResponse(response)
}

export async function getPerson (personId) {
  const response = await fetch(`${API_URL}/people/${personId}`)
  return handleResponse(response)
}

export async function getSeries (seriesId) {
  const response = await fetch(`${API_URL}/series/${seriesId}`)
  return handleResponse(response)
}

export function formatImageUri (path) {
  return `${BASE_URL}/${path}`
}
