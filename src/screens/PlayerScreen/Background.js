import React from 'react'
import { ImageBackground, Platform } from 'react-native'
import tw from '../../lib/tailwind'

export default function Background ({ children, imageSource }) {
  return (
    <ImageBackground
      source={imageSource}
      blurRadius={Platform.OS === 'ios' ? 25 : 10}
      style={tw.style('h-full', { resizeMode: 'cover' })}
    >
      {children}
    </ImageBackground>
  )
}
