import React from 'react'
import { ImageBackground } from 'react-native'
import { usePlayer } from '../../contexts/Player'
import tw from '../../lib/tailwind'

export default function Background ({ children }) {
  const { imageSource } = usePlayer()

  return (
    <ImageBackground
      source={imageSource}
      blurRadius={8}
      style={tw.style('h-full', { resizeMode: 'cover' })}
    >
      {children}
    </ImageBackground>
  )
}
