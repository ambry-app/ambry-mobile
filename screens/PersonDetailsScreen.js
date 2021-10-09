import React, { useEffect, useReducer, useCallback } from 'react'
import { Image, ScrollView, Text, View } from 'react-native'
import tw from '../lib/tailwind'

import Description from '../components/Description'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'

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
        <ScreenCentered>
          <LargeActivityIndicator />
        </ScreenCentered>
      )
    }

    if (error) {
      return (
        <ScreenCentered>
          <Text>Failed to load person!</Text>
        </ScreenCentered>
      )
    }
  } else {
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
              source={{ uri: formatImageUri(person.imagePath) }}
              style={tw.style('rounded-full w-full', {
                aspectRatio: 1 / 1
              })}
            />
          </View>
          <Description description={person.description} />
          {/* TODO: books authored and/or narrated go here */}
        </View>
      </ScrollView>
    )
  }

  return null
}
