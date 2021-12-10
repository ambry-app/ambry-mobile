import { State } from 'react-native-track-player'

export function secondsDisplay(input) {
  const total = Number(input)
  const hours = String(Math.floor(total / 3600))
  const minutes = String(Math.floor((total % 3600) / 60))
  const seconds = String(Math.floor((total % 3600) % 60))

  if (hours === '0') {
    return `${minutes}:${seconds.padStart(2, '0')}`
  } else {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
  }
}

export function secondsDisplayMinutesOnly(input) {
  const total = Number(input)
  const minutes = String(Math.floor(total / 60))
  const seconds = String(Math.floor(total % 60))

  return `${minutes}:${seconds.padStart(2, '0')}`
}

export function durationDisplay(input) {
  const total = Number(input)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)

  if (hours === 0) {
    return `${minutes} minutes`
  } else {
    return `${hours} hours and ${minutes} minutes`
  }
}

export function progressPercent(durationSeconds, positionSeconds) {
  return durationSeconds && durationSeconds > 0
    ? ((positionSeconds / durationSeconds) * 100).toFixed(1) + '%'
    : '0.0%'
}

// React native track player is in a playing state if it's either playing or
// buffering. All other states are "not playing".

// TrackPlayer States
// {
//   0: 'None',
//   1: 'Stopped',
//   2: 'Paused',
//   3: 'Playing',
//   6: 'Buffering',
//   8: 'Connecting'
// }

export function isPlaying(trackPlayerState) {
  return (
    trackPlayerState === State.Playing || trackPlayerState === State.Buffering
  )
}

export function isPaused(trackPlayerState) {
  return !isPlaying(trackPlayerState)
}
