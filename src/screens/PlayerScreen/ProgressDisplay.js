import React, { memo, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import { usePlayer } from '../../contexts/Player'
import tw from '../../lib/tailwind'
import { progressPercent, secondsDisplay } from '../../lib/utils'

function buildProgressDisplay(
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

export default function ProgressDisplay() {
  const { state } = usePlayer()
  const { position, buffered, media, playbackRate } = state
  const { duration } = media

  return (
    <ActualProgressDisplay
      position={position}
      buffered={buffered}
      duration={duration}
      playbackRate={playbackRate}
    />
  )
}

const ActualProgressDisplay = memo(
  ({ position, buffered, duration, playbackRate }) => {
    // console.log('RENDERING: ProgressDisplay')
    const [progressDisplay, setProgressDisplay] = useState()
    const opacity = useSharedValue(0)

    useEffect(() => {
      setProgressDisplay(
        buildProgressDisplay(duration, position, buffered, playbackRate)
      )
    }, [position, buffered, duration, playbackRate])

    useEffect(() => {
      if (progressDisplay) {
        opacity.value = withTiming(1, { duration: 150 })
      } else {
        opacity.value = 0
      }
    }, [opacity, progressDisplay])

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value
      }
    })

    return (
      <Animated.View style={[tw`my-4`, animatedStyle]}>
        <View style={tw`shadow-md rounded-full`}>
          <View
            style={tw`h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden`}
          >
            <View
              style={tw.style('absolute h-2 bg-gray-400 dark:bg-gray-500', {
                width: progressDisplay?.bufferedPercent
              })}
            />
            <View
              style={tw.style('h-2 bg-lime-500 dark:bg-lime-400', {
                width: progressDisplay?.percent
              })}
            />
          </View>
        </View>
        <View style={tw`flex-row justify-between`}>
          <Text
            style={tw`text-gray-500 dark:text-gray-400 text-sm tabular-nums`}
          >
            {progressDisplay?.position} of {progressDisplay?.duration}
          </Text>
          <Text
            style={tw`text-gray-500 dark:text-gray-400 text-sm tabular-nums`}
          >
            {progressDisplay?.percent}
          </Text>
          <Text
            style={tw`text-gray-500 dark:text-gray-400 text-sm tabular-nums`}
          >
            -{progressDisplay?.remaining}
          </Text>
        </View>
      </Animated.View>
    )
  }
)
