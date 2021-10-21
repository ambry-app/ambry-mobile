export function secondsDisplay (input) {
  const total = Number(input)
  const hours = String(Math.floor(total / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const seconds = String(Math.floor((total % 3600) % 60)).padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
}

export function durationDisplay (input) {
  const total = Number(input)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)

  return `${hours} hours and ${minutes} minutes`
}
