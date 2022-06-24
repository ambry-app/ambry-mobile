// yanked from react-native-redash:
// https://github.com/wcandillon/react-native-redash/blob/fd0b0ddb3b4c10ae88cf1f8a95890c7c5eb3c475/src/ReText.tsx

import React from 'react'
import { StyleSheet, TextInput } from 'react-native'
import Animated, { useAnimatedProps } from 'react-native-reanimated'

const styles = StyleSheet.create({
  baseStyle: {
    color: 'black'
  }
})
Animated.addWhitelistedNativeProps({ text: true })

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

const AnimatedText = props => {
  const { text, style } = { style: {}, ...props }
  const animatedProps = useAnimatedProps(() => {
    return {
      text: text.value
    }
  })
  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      value={text.value}
      style={[styles.baseStyle, style]}
      {...{ animatedProps }}
    />
  )
}

export default AnimatedText
