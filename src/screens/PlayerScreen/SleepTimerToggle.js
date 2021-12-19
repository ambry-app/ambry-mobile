import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import {
  LongPressGestureHandler,
  TouchableNativeFeedback
} from 'react-native-gesture-handler'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'
import { State, usePlaybackState } from 'react-native-track-player'
import tw from '../../lib/tailwind'
import { secondsDisplayMinutesOnly } from '../../lib/utils'
import SleepTimer, { useSleepTimer } from '../../stores/SleepTimer'
import SecondsModal from './SleepTimerToggle/SecondsModal'

export default function SleepTimerToggle() {
  const { enabled, countdownSeconds, isRunning, targetTime } = useSleepTimer()
  const playbackState = usePlaybackState()
  const [modalVisible, setModalVisible] = useState(false)
  const [currentCountdownSeconds, setCurrentCountdownSeconds] =
    useState(countdownSeconds)
  const isActive = useSharedValue(enabled ? 1 : 0)

  useEffect(() => {
    if (enabled) {
      isActive.value = withTiming(1, { duration: 200 })
    } else {
      isActive.value = withTiming(0, { duration: 200 })
    }
  }, [isActive, enabled])

  useEffect(() => {
    if (targetTime) {
      setCurrentCountdownSeconds(Math.round((targetTime - Date.now()) / 1000))
    } else {
      setCurrentCountdownSeconds(countdownSeconds)
    }
  }, [countdownSeconds, targetTime])

  useEffect(() => {
    let interval

    if (isRunning) {
      interval = setInterval(
        () =>
          setCurrentCountdownSeconds(
            Math.round((targetTime - Date.now()) / 1000)
          ),
        1000
      )
    }

    return () => {
      clearInterval(interval)
    }
  }, [isRunning, targetTime])

  const toggleSleepTimer = useCallback(async () => {
    SleepTimer.toggleEnabled(playbackState === State.Playing)
  }, [playbackState])

  const animatedViewStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(isActive.value, [1, 0], [0, 8])
  }))

  const animatedTextStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(isActive.value, [1, 0], [0, 10])
  }))

  const onLongPress = useCallback(() => {
    ReactNativeHapticFeedback.trigger('soft')
    setModalVisible(true)
  }, [])

  const onRequestModalClose = useCallback(() => {
    setModalVisible(false)
  }, [])

  const onNewCountdownSeconds = useCallback(async value => {
    SleepTimer.setCountdown(value)
  }, [])

  return (
    <>
      <SecondsModal
        visible={modalVisible}
        countdownSeconds={countdownSeconds}
        onNewValue={onNewCountdownSeconds}
        onRequestClose={onRequestModalClose}
      />
      <TouchableNativeFeedback onPress={toggleSleepTimer}>
        <LongPressGestureHandler
          onActivated={onLongPress}
          minDurationMs={300}
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
              stroke={enabled ? tw.color('lime-400') : tw.color('gray-400')}
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
                  enabled ? tw`text-lime-400` : tw`text-gray-400`,
                  styles.textSize
                ]}
              >
                {secondsDisplayMinutesOnly(currentCountdownSeconds)}
              </Text>
            </Animated.View>
          </Animated.View>
        </LongPressGestureHandler>
      </TouchableNativeFeedback>
    </>
  )
}

const styles = StyleSheet.create({
  viewSize: { height: 42, width: 42 },
  textSize: { height: 18 }
})
