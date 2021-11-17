import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, useColorScheme } from 'react-native'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withTiming
} from 'react-native-reanimated'
import { clamp, ReText } from 'react-native-redash'
import Svg, { Line, Path } from 'react-native-svg'
import tw from '../../../lib/tailwind'

const SPACING = 10 // pixels between ticks
const FACTOR = SPACING / 5 // 5 seconds per tick

const WIDTH = Dimensions.get('window').width
const HEIGHT = 60
const HALF_WIDTH = WIDTH / 2
const NUM_TICKS = Math.ceil(WIDTH / SPACING)

function friction (value) {
  'worklet'

  const MAX_FRICTION = 200
  const MAX_VALUE = 400

  const res = Math.max(
    1,
    Math.min(
      MAX_FRICTION,
      1 + (Math.abs(value) * (MAX_FRICTION - 1)) / MAX_VALUE
    )
  )

  if (value < 0) {
    return -res
  }

  return res
}

function timeToTranslateX (time) {
  return time * -FACTOR
}

function translateXToTime (translateX) {
  'worklet'
  return translateX / -FACTOR
}

function useIsScrubbing () {
  const [isScrubbing, _setIsScrubbing] = useState(false)
  const timerRef = useRef()

  const setIsScrubbing = useCallback(newValue => {
    if (newValue) {
      // if true, set immediately
      _setIsScrubbing(true)
      // and cancel any active timer that may be waiting
      clearTimeout(timerRef.current)
    } else {
      // if false, delay by 1 second
      timerRef.current = setTimeout(() => {
        _setIsScrubbing(false)
      }, 1000)
    }
  })

  return [isScrubbing, setIsScrubbing]
}

export default function Scrubber ({
  position: positionInput,
  duration,
  onChange
}) {
  // console.log('RENDERING: Scrubber')
  const translateX = useSharedValue(timeToTranslateX(Math.round(positionInput)))
  const [isScrubbing, setIsScrubbing] = useIsScrubbing()
  const maxTranslateX = timeToTranslateX(duration)
  const scheme = useColorScheme()

  const theme =
    scheme == 'dark'
      ? {
          strong: tw.color('gray-200'),
          emphasized: tw.color('gray-300'),
          normal: tw.color('gray-400'),
          dimmed: tw.color('gray-500')
        }
      : {
          strong: tw.color('gray-800'),
          emphasized: tw.color('gray-600'),
          normal: tw.color('gray-500'),
          dimmed: tw.color('gray-400')
        }

  const onGestureEventHandler = useAnimatedGestureHandler({
    onStart: (_event, ctx) => {
      runOnJS(setIsScrubbing)(true)
      const currentX = translateX.value
      ctx.startX = currentX
      translateX.value = currentX
    },
    onActive: (event, ctx) => {
      const nextTranslateX = ctx.startX + event.translationX

      if (nextTranslateX < maxTranslateX) {
        translateX.value =
          maxTranslateX + friction(nextTranslateX - maxTranslateX)
      } else if (nextTranslateX > 0) {
        translateX.value = friction(nextTranslateX)
      } else {
        translateX.value = nextTranslateX
      }
    },
    onEnd: (event, ctx) => {
      const onFinish = finished => {
        ctx.animating = false

        if (finished) {
          const newPosition = translateXToTime(translateX.value)
          runOnJS(onChange)(newPosition)
          runOnJS(setIsScrubbing)(false)
        }
      }

      ctx.animating = true

      if (translateX.value < maxTranslateX || translateX.value > 0) {
        const toValue = translateX.value > 0 ? 0 : maxTranslateX

        translateX.value = withTiming(
          toValue,
          {
            duration: 250,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1)
          },
          onFinish
        )
      } else {
        translateX.value = withDecay(
          {
            velocity: event.velocityX,
            clamp: [maxTranslateX, 0]
          },
          onFinish
        )
      }
    },
    onFinish (_event, ctx) {
      if (!ctx.animating) {
        const newPosition = translateXToTime(translateX.value)
        runOnJS(onChange)(newPosition)
        runOnJS(setIsScrubbing)(false)
      }
    }
  })

  const animatedScrubberStyle = useAnimatedStyle(() => {
    const value = translateX.value

    if (value < -HALF_WIDTH) {
      // we're at the end or in the middle somewhere
      return {
        transform: [{ translateX: (HALF_WIDTH + value) % (SPACING * 12) }]
      }
    } else {
      // we're at the beginning
      return {
        transform: [{ translateX: HALF_WIDTH + value }]
      }
    }
  })

  const animatedMaskStyle = useAnimatedStyle(() => {
    const value = translateX.value

    if (value < -HALF_WIDTH && value - HALF_WIDTH <= maxTranslateX) {
      // we're at the end
      const translate = (HALF_WIDTH + value) % (SPACING * 12)
      const diff = maxTranslateX - value
      const width = HALF_WIDTH - translate - diff
      return {
        width: width
      }
    } else {
      // we're at the beginning or in the middle somewhere
      return {
        width: WIDTH + 120
      }
    }
  })

  const timecode = useDerivedValue(() => {
    const total = clamp(translateXToTime(translateX.value), 0, duration)
    const hours = Math.floor(total / 3600).toString()
    const minutes = Math.floor((total % 3600) / 60).toString()
    const seconds = Math.floor((total % 3600) % 60).toString()

    if (hours == '0') {
      return `${minutes}:${seconds.padStart(2, '0')}`
    } else {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
    }
  })

  useEffect(() => {
    if (!isScrubbing) {
      translateX.value = timeToTranslateX(Math.round(positionInput))
    }
  }, [positionInput])

  return (
    <PanGestureHandler onGestureEvent={onGestureEventHandler}>
      <Animated.View>
        <ReText
          text={timecode}
          style={{
            fontWeight: '300',
            fontSize: 16,
            padding: 0,
            marginBottom: -6,
            textAlign: 'center',
            color: theme.strong,
            fontVariant: ['tabular-nums']
          }}
        />
        <Svg
          style={{ left: HALF_WIDTH - 4, top: 4, zIndex: 1 }}
          height='8'
          width='8'
          viewBox='0 0 8 8'
        >
          <Path
            d='m 0.17 0 c -1 -0 2.83 8 3.83 8 c 1 0 4.83 -8 3.83 -8 z'
            fill={theme.strong}
            stroke={
              scheme == 'dark' ? tw.color('gray-800') : tw.color('gray-300')
            }
            strokeWidth='1'
          />
        </Svg>

        <Animated.View
          style={[
            { height: HEIGHT, width: WIDTH + 12 * SPACING },
            animatedScrubberStyle
          ]}
        >
          <>
            <Animated.View
              style={[
                { height: HEIGHT, overflow: 'hidden' },
                animatedMaskStyle
              ]}
            >
              <Svg height={HEIGHT} width={WIDTH + 120}>
                {Array.from({ length: NUM_TICKS + 12 }, (_, i) => (
                  <Line
                    key={i}
                    x1={0.5 + i * SPACING}
                    y1={0}
                    x2={0.5 + i * SPACING}
                    y2={i % 12 == 0 ? 40 : i % 6 == 0 ? 32 : 24}
                    stroke={
                      i % 12 == 0
                        ? theme.emphasized
                        : i % 6 == 0
                        ? theme.normal
                        : theme.dimmed
                    }
                    strokeWidth='1'
                  />
                ))}
              </Svg>
            </Animated.View>
          </>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  )
}
