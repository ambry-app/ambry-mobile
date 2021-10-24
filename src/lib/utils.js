export function secondsDisplay (input) {
  const total = Number(input)
  const hours = String(Math.floor(total / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const seconds = String(Math.floor((total % 3600) % 60)).padStart(2, '0')

  if (hours == '00') {
    return `${minutes}:${seconds}`
  } else {
    return `${hours}:${minutes}:${seconds}`
  }
}

export function durationDisplay (input) {
  const total = Number(input)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)

  if (hours == 0) {
    return `${minutes} minutes`
  } else {
    return `${hours} hours and ${minutes} minutes`
  }
}

export function progressPercent (durationSeconds, positionSeconds) {
  return durationSeconds && durationSeconds > 0
    ? ((positionSeconds / durationSeconds) * 100).toFixed(1) + '%'
    : '0.0%'
}
