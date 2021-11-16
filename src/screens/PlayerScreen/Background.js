import React from 'react'
import { ImageBackground } from 'react-native'
import tw from '../../lib/tailwind'

export default function Background ({ children, imageSource, blur }) {
  return (
    <ImageBackground
      source={imageSource}
      blurRadius={blur}
      style={tw.style('h-full', { resizeMode: 'cover' })}
    >
      {children}
    </ImageBackground>
  )
}
