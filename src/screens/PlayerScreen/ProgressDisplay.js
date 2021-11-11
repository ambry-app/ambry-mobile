import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { useProgress } from 'react-native-track-player'
import tw from '../../lib/tailwind'
import { progressPercent, secondsDisplay } from '../../lib/utils'

const initialState = {
  percent: '0.0%',
  bufferedPercent: '0.0%',
  position: '00:00',
  duration: '00:00',
  remaining: '00:00'
}

function buildProgressDisplay (
  durationSeconds,
  positionSeconds,
  bufferedSeconds,
  playbackRate
) {
  const percent = progressPercent(durationSeconds, positionSeconds)
  const bufferedPercent = progressPercent(durationSeconds, bufferedSeconds)
  const position = secondsDisplay(positionSeconds)
  const duration = secondsDisplay(durationSeconds)
  const remainingSeconds = Math.max(durationSeconds - positionSeconds, 0)
  const rate = playbackRate || 1
  const remaining = secondsDisplay(remainingSeconds / rate)

  return {
    percent,
    bufferedPercent,
    position,
    duration,
    remaining
  }
}

export default function ProgressDisplay ({
  loadingTrack,
  playbackRate,
  playerState
}) {
  const progress = useProgress()
  const [progressDisplay, setProgressDisplay] = useState(initialState)

  useEffect(() => {
    if (loadingTrack) {
      const {
        media: { duration: durationSeconds },
        position: positionSeconds
      } = playerState
      const progressDisplay = buildProgressDisplay(
        durationSeconds,
        positionSeconds,
        0,
        playbackRate
      )
      setProgressDisplay(progressDisplay)
    } else {
      const {
        duration: durationSeconds,
        position: positionSeconds,
        buffered: bufferedSeconds
      } = progress
      const progressDisplay = buildProgressDisplay(
        durationSeconds,
        positionSeconds,
        bufferedSeconds,
        playbackRate
      )
      setProgressDisplay(progressDisplay)
    }
  }, [progress, playbackRate, loadingTrack, playerState])

  return (
    <View style={tw`my-4`}>
      <View style={tw`shadow-md rounded-full`}>
        <View
          style={tw`h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden`}
        >
          <View
            style={tw.style('absolute h-2 bg-gray-400 dark:bg-gray-500', {
              width: progressDisplay.bufferedPercent
            })}
          ></View>
          <View
            style={tw.style('h-2 bg-lime-500 dark:bg-lime-400', {
              width: progressDisplay.percent
            })}
          ></View>
        </View>
      </View>
      <View style={tw`flex-row justify-between`}>
        <Text style={tw`text-gray-500 dark:text-gray-400 text-sm tabular-nums`}>
          {progressDisplay.position} of {progressDisplay.duration}
        </Text>
        <Text style={tw`text-gray-500 dark:text-gray-400 text-sm tabular-nums`}>
          {progressDisplay.percent}
        </Text>
        <Text style={tw`text-gray-500 dark:text-gray-400 text-sm tabular-nums`}>
          -{progressDisplay.remaining}
        </Text>
      </View>
    </View>
  )
}
