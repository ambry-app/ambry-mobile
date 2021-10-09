import React, { useEffect, useReducer, useCallback } from 'react'
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import Markdown from 'react-native-markdown-display'
import tw from '../lib/tailwind'

import { formatImageUri, getPerson } from '../api/ambry'
import { actionCreators, initialState, reducer } from '../reducers/person'

export default function PersonDetailsScreen ({ route }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const { person, loading, error } = state

  const fetchPerson = useCallback(async () => {
    dispatch(actionCreators.loading())

    try {
      const person = await getPerson(route.params.personId)
      dispatch(actionCreators.success(person))
    } catch (e) {
      dispatch(actionCreators.failure())
    }
  }, [route.params.personId])

  useEffect(() => {
    fetchPerson()
  }, [])

  if (!person) {
    if (loading) {
      return (
        <View style={tw.style('items-center justify-center', { flex: 1 })}>
          <ActivityIndicator animating={true} />
        </View>
      )
    }

    if (error) {
      return (
        <View style={tw.style('items-center justify-center', { flex: 1 })}>
          <Text>Failed to load person!</Text>
        </View>
      )
    }
  } else {
    const markdownStyles = StyleSheet.create({
      // Tailwind `text-gray-700` when gray = colors.gray in tailwind.config.js
      body: { color: '#3F3F46', fontSize: 18 }
    })

    return (
      <ScrollView>
        <View style={tw`p-4`}>
          <Text style={tw`text-4xl text-gray-700 text-center`}>
            {person.name}
          </Text>
          <View
            style={tw`mx-12 my-8 rounded-full border-gray-200 bg-gray-200 shadow-lg`}
          >
            <Image
              source={{ uri: formatImageUri(person.image_path) }}
              style={tw.style('rounded-full w-full', {
                aspectRatio: 1 / 1
              })}
            />
          </View>
          <Markdown style={markdownStyles}>{person.description}</Markdown>
        </View>
        {/* TODO: books authored and/or narrated go here */}
      </ScrollView>
    )
  }

  return null
}
