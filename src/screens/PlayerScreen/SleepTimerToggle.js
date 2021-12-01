import React, { memo, useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import {
  LongPressGestureHandler,
  TouchableNativeFeedback
} from 'react-native-gesture-handler'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'
import { State, usePlaybackState } from 'react-native-track-player'
import useFirstRender from '../../hooks/firstRender'
import tw from '../../lib/tailwind'
import { secondsDisplayMinutesOnly } from '../../lib/utils'
import SleepTimer from '../../modules/SleepTimer'

const initialState = {
  enabled: false,
  isRunning: false,
  countdownSeconds: undefined,
  currentCountdownSeconds: undefined,
  modalVisible: false
}

export default function SleepTimerToggle() {
  return <ActualSleepTimerToggle />
}

const ActualSleepTimerToggle = memo(() => {
  const isFirstRender = useFirstRender()
  const playbackState = usePlaybackState()
  const [state, setState] = useState(initialState)
  const isActive = useSharedValue(0)

  if (isFirstRender) {
    ;(async () => {
      const timer = await SleepTimer.get()

      if (timer.enabled) {
        isActive.value = 1
      }

      setState(currentState => ({
        ...currentState,
        enabled: timer.enabled,
        isRunning: !!timer.targetTime,
        countdownSeconds: timer.countdownSeconds,
        currentCountdownSeconds: timer.targetTime
          ? Math.round((timer.targetTime - Date.now()) / 1000)
          : timer.countdownSeconds
      }))
    })()
  }

  useEffect(() => {
    ;(async () => {
      if (playbackState === State.Playing) {
        const timer = await SleepTimer.get()

        if (timer.enabled && !timer.targetTime) {
          SleepTimer.start()

          setState(currentState => ({
            ...currentState,
            isRunning: true
          }))
        }
      } else if (playbackState === State.Paused) {
        const timer = await SleepTimer.get()

        if (timer.enabled && timer.targetTime) {
          SleepTimer.stop()

          setState(currentState => ({
            ...currentState,
            isRunning: false,
            currentCountdownSeconds: currentState.countdownSeconds
          }))
        }
      }
    })()
  }, [playbackState])

  useEffect(() => {
    let interval

    if (state.isRunning) {
      interval = setInterval(
        () =>
          setState(currentState => {
            const nextCountdownSeconds =
              currentState.currentCountdownSeconds - 1

            if (nextCountdownSeconds === -1) {
              return {
                ...currentState,
                isRunning: false,
                currentCountdownSeconds: currentState.countdownSeconds
              }
            } else {
              return {
                ...currentState,
                currentCountdownSeconds: nextCountdownSeconds
              }
            }
          }),
        1000
      )
    }

    return () => {
      clearInterval(interval)
    }
  }, [state.isRunning])

  const toggleSleepTimer = useCallback(async () => {
    const timer = await SleepTimer.toggleEnabled(
      playbackState === State.Playing
    )

    setState(currentState => ({
      ...currentState,
      enabled: timer.enabled,
      isRunning: !!timer.targetTime,
      currentCountdownSeconds: timer.enabled
        ? currentState.countdownSeconds
        : currentState.currentCountdownSeconds
    }))

    if (timer.enabled) {
      isActive.value = withTiming(1, { duration: 200 })
    } else {
      isActive.value = withTiming(0, { duration: 200 })
    }
  }, [isActive, playbackState])

  const animatedViewStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(isActive.value, [1, 0], [0, 8])
  }))

  const animatedTextStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(isActive.value, [1, 0], [0, 10])
  }))

  return (
    <TouchableNativeFeedback onPress={toggleSleepTimer}>
      <LongPressGestureHandler
        onActivated={() => {}}
        minDurationMs={500}
        maxDist={100}
      >
        <Animated.View
          style={[
            tw`flex items-center overflow-hidden`,
            styles.viewSize,
            animatedViewStyle
          ]}
        >
          <Svg
            style={tw`-mb-1`}
            height="30"
            width="30"
            viewBox="0 0 24 24"
            stroke={state.enabled ? tw.color('lime-400') : tw.color('gray-400')}
          >
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M 10.5 10 H 13.5 L 10.5 14 H 13.5 M 10 1.5 H 14 M 18.5 2.5 L 20.5 4.5 M 17 6 L 19.5 3.5 M 19.5 12 A 7.5 7.5 90 0 1 12 19.5 A 7.5 7.5 90 0 1 4.5 12 A 7.5 7.5 90 0 1 12 4.5 A 7.5 7.5 90 0 1 19.5 12 Z"
            />
          </Svg>
          <Animated.View style={animatedTextStyle}>
            <Text
              style={[
                tw`text-xs`,
                state.enabled ? tw`text-lime-400` : tw`text-gray-400`,
                styles.textSize
              ]}
            >
              {secondsDisplayMinutesOnly(state.currentCountdownSeconds)}
            </Text>
          </Animated.View>
        </Animated.View>
      </LongPressGestureHandler>
    </TouchableNativeFeedback>
  )
})

const styles = StyleSheet.create({
  viewSize: { height: 42, width: 42 },
  textSize: { height: 18 }
})
