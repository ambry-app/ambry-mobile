import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
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
import { State, usePlaybackState } from 'react-native-track-player'
import tw from '../../lib/tailwind'
import { secondsDisplayMinutesOnly } from '../../lib/utils'
import SleepTimer, { useSleepTimer } from '../../stores/SleepTimer'
import SecondsModal from './SleepTimerToggle/SecondsModal'

function calcCountdownSeconds(targetTime) {
  return Math.max(0, Math.round((targetTime - Date.now()) / 1000))
}

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
      setCurrentCountdownSeconds(calcCountdownSeconds(targetTime))
    } else {
      setCurrentCountdownSeconds(countdownSeconds)
    }
  }, [countdownSeconds, targetTime])

  useEffect(() => {
    let interval

    if (isRunning) {
      interval = setInterval(
        () => setCurrentCountdownSeconds(calcCountdownSeconds(targetTime)),
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
      <TouchableNativeFeedback
        onPress={toggleSleepTimer}
        background={TouchableNativeFeedback.Ripple(tw.color('gray-400'), true)}
      >
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
            <FontAwesomeIcon
              icon="stopwatch"
              color={enabled ? tw.color('gray-100') : tw.color('gray-500')}
              size={24}
            />
            <Animated.View style={animatedTextStyle}>
              <Text
                style={[
                  tw`text-xs`,
                  enabled ? tw`text-gray-100` : tw`text-gray-500`,
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
