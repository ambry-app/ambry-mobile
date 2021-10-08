const BASE_URL = `http://192.168.0.8:4000/api`

export async function getRecentBooks (page = 1) {
  const response = await fetch(`${BASE_URL}/books?page=${page}`)
  const result = await response.json()
  return result.data
}

export function formatImageUri (path) {
  return `http://192.168.0.8:4000/${path}`
}
