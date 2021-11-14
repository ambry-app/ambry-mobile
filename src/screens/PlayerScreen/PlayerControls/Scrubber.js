import usePrevious from '@react-hook/previous'
import React, { useEffect } from 'react'
import { Dimensions, View } from 'react-native'
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
import { useState } from 'react/cjs/react.development'
import tw from '../../../lib/tailwind'

const SPACING = 10 // pixels between ticks
const FACTOR = SPACING / 5 // 5 seconds per tick

const WIDTH = Dimensions.get('window').width
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

export default function Scrubber ({
  position: positionInput,
  duration,
  onChange
}) {
  const translateX = useSharedValue(timeToTranslateX(positionInput))
  const [isAnimating, setIsAnimating] = useState(false)
  const previousIsAnimating = usePrevious(isAnimating)
  const maxTranslateX = timeToTranslateX(duration)

  const onGestureEventHandler = useAnimatedGestureHandler({
    onStart: (_event, ctx) => {
      runOnJS(setIsAnimating)(true)
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
    onEnd: (event, _ctx) => {
      const onFinish = finished => {
        if (finished) {
          const newPosition = translateXToTime(translateX.value)
          runOnJS(onChange)(newPosition)
          runOnJS(setIsAnimating)(false)
        }
      }

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
    if (!isAnimating && !previousIsAnimating) {
      translateX.value = timeToTranslateX(positionInput)
    }
  }, [positionInput])

  return (
    <>
      <ReText
        text={timecode}
        style={{
          textAlign: 'center',
          color: 'white',
          fontVariant: ['tabular-nums']
        }}
      />
      <View
        style={tw`relative left-[${HALF_WIDTH +
          1}px] h-2 border-l-2 border-white`}
      ></View>
      <PanGestureHandler onGestureEvent={onGestureEventHandler}>
        <Animated.View
          style={[
            tw`h-[75px] `,
            { width: WIDTH + 12 * SPACING },
            animatedScrubberStyle
          ]}
        >
          <>
            <Animated.View
              style={[tw`h-[75px]  overflow-hidden`, animatedMaskStyle]}
            >
              {Array.from({ length: NUM_TICKS + 12 }, (_, i) => (
                <View
                  key={`tick-${i}`}
                  style={[
                    tw`absolute border-r`,
                    i % 12 == 0
                      ? tw`h-10 border-gray-300`
                      : i % 6 == 0
                      ? tw`h-8 border-gray-400`
                      : tw`h-6 border-gray-500`,
                    { transform: [{ translateX: i * SPACING }] }
                  ]}
                ></View>
              ))}
            </Animated.View>
          </>
        </Animated.View>
      </PanGestureHandler>
    </>
  )
}
