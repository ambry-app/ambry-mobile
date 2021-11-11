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
import { ReText } from 'react-native-redash'
import { useState } from 'react/cjs/react.development'
import tw from '../../../lib/tailwind'

const SPACING = 10
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

export default function Scrubber ({
  position: positionInput,
  duration: durationInput,
  onChange
}) {
  const position = useSharedValue(positionInput * -2)
  const duration = useSharedValue(-durationInput * 2)
  const [isAnimating, setIsAnimating] = useState(false)
  const previousIsAnimating = usePrevious(isAnimating)

  const onGestureEventHandler = useAnimatedGestureHandler({
    onStart: (_event, ctx) => {
      runOnJS(setIsAnimating)(true)
      const currentX = position.value
      ctx.startX = currentX
      position.value = currentX
    },
    onActive: (event, ctx) => {
      const nextTranslateX = ctx.startX + event.translationX

      if (nextTranslateX < duration.value) {
        position.value =
          duration.value + friction(nextTranslateX - duration.value)
      } else if (nextTranslateX > 0) {
        position.value = friction(nextTranslateX)
      } else {
        position.value = nextTranslateX
      }
    },
    onEnd: (event, _ctx) => {
      const onFinish = finished => {
        if (finished) {
          const newPosition = Math.abs(position.value / -2)
          runOnJS(onChange)(newPosition)
          runOnJS(setIsAnimating)(false)
        }
      }

      if (position.value < duration.value || position.value > 0) {
        const toValue = position.value > 0 ? 0 : duration.value

        position.value = withTiming(
          toValue,
          {
            duration: 250,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1)
          },
          onFinish
        )
      } else {
        position.value = withDecay(
          {
            velocity: event.velocityX,
            clamp: [duration.value, 0]
          },
          onFinish
        )
      }
    }
  })

  const animatedStyle = useAnimatedStyle(() => {
    const value = position.value
    const durationValue = duration.value

    if (value < -HALF_WIDTH) {
      if (value - HALF_WIDTH <= durationValue) {
        // we're at the end
        const translate = (HALF_WIDTH + value) % (SPACING * 12)
        const diff = durationValue - value
        const width = HALF_WIDTH - translate - diff
        return {
          width: width,
          transform: [{ translateX: translate }]
        }
      } else {
        // we're in the middle somewhere
        return {
          width: WIDTH + 120,
          transform: [{ translateX: (HALF_WIDTH + value) % (SPACING * 12) }]
        }
      }
    } else {
      // we're at the beginning
      return {
        width: WIDTH + 120,
        transform: [{ translateX: HALF_WIDTH + value }]
      }
    }
  })

  const timecode = useDerivedValue(() => {
    const value = position.value / 2
    const durationValue = duration.value / 2
    const total =
      value > 0 ? 0 : value < durationValue ? durationValue * -1 : value * -1
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
      position.value = positionInput * -2
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
        <Animated.View style={[tw`h-[75px] overflow-hidden`, animatedStyle]}>
          {Array.from({ length: NUM_TICKS + 12 }, (_, i) => {
            const idx = i
            return (
              <View key={`tick-${idx}`}>
                <View
                  style={[
                    tw`absolute border-r`,
                    idx % 12 == 0
                      ? tw`h-10 border-gray-300`
                      : idx % 6 == 0
                      ? tw`h-8 border-gray-400`
                      : tw`h-6 border-gray-500`,
                    { transform: [{ translateX: idx * SPACING }] }
                  ]}
                ></View>
              </View>
            )
          })}
        </Animated.View>
      </PanGestureHandler>
    </>
  )
}
