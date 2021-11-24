import React from 'react'
import { StyleSheet, useColorScheme } from 'react-native'
import Markdown from 'react-native-markdown-display'
import tw from '../lib/tailwind'

export default function Description({ description }) {
  const scheme = useColorScheme()
  const markdownStyles = StyleSheet.create({
    body: {
      color: scheme === 'dark' ? tw.color('gray-200') : tw.color('gray-700'),
      fontSize: 18
    }
  })

  return <Markdown style={markdownStyles}>{description || ''}</Markdown>
}
