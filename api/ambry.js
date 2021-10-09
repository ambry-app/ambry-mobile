const BASE_URL = `http://192.168.0.8:4000`
const API_URL = `${BASE_URL}/api`

export async function getRecentBooks (page = 1) {
  const response = await fetch(`${API_URL}/books?page=${page}`)
  const result = await response.json()
  return result.data
}

export async function getBook (bookId) {
  const response = await fetch(`${API_URL}/books/${bookId}`)
  const result = await response.json()
  return result.data
}

export async function getPerson (personId) {
  const response = await fetch(`${API_URL}/people/${personId}`)
  const result = await response.json()
  return result.data
}

export function formatImageUri (path) {
  return `${BASE_URL}/${path}`
}
