import React from 'react'
import { StyleSheet } from 'react-native'
import Markdown from 'react-native-markdown-display'
import tw from '../lib/tailwind'

export default function Description({ description }) {
  const markdownStyles = StyleSheet.create({
    body: {
      color: tw.color('gray-200'),
      fontSize: 18
    }
  })

  return <Markdown style={markdownStyles}>{description || ''}</Markdown>
}
